import { check,validationResult  } from 'express-validator'
import bcrypt from 'bcrypt'
import Usuario from '../models/Usuario.js'
import {generarId} from '../helpers/token.js'
import { emailRegistro,emailOlvidePassword } from '../helpers/emails.js'


const formularioLogin=(req,res)=>{
    res.render('auth/login',{
        pagina:'Iniciar Sesion',
        csrfToken: req.csrfToken()
    })
}

const autenticar = async (req,res) => {


}

const formularioRegistro=(req,res)=>{
    res.render('auth/registro',{
        pagina:'Crear Cuenta',
        csrfToken : req.csrfToken()
    })
}

const registrar=async (req,res)=>{
    //Validacion 
    await check('nombre').notEmpty().withMessage('El nombre no puede ir vacio').run(req)
    await check('email').isEmail().withMessage('Eso no parece un Email').run(req)
    await check('password').isLength({min:6}).withMessage('El Password debe ser al menos de 6 caracteres').run(req)
    await check('repetir_password').equals(req.body.password).withMessage('Los Passwords no son iguales').run(req)


    let resultado=validationResult(req)

    //Verificacion de que el resultado este vacio
    if(!resultado.isEmpty()){
        console.log(req.body.email);
        return res.render('auth/registro',{
            pagina:'Crear Cuenta',
            csrfToken : req.csrfToken(),
            errores:resultado.array(),
            usuario:{
                nombre:req.body.nombre,
                email:req.body.email
            }
        }) 
      
    }

    const {nombre,email,password}=req.body
    //Verificar que no haya usuarios duplicados
    const existeUsuario=await Usuario.findOne({where:{email:req.body.email}})
    if(existeUsuario){
        return res.render('auth/registro',{
            pagina:'Crear Cuenta',
            errores:[{msg:'El usuario ya esta registrado'}],
            usuario:{
                nombre:req.body.nombre,
                email:req.body.email
            }
        }) 
    }

    //Almacenar un usuario
    const usuario =await Usuario.create({
        nombre,
        email,
        password,
        token:generarId()
    })

    //Envia email de confirmacion
    emailRegistro({
        nombre:usuario.nombre,
        email:usuario.email,
        token:usuario.token
    })

  //Mostrar mensaje de confirmacion 
  res.render('templates/mensaje',{
    pagina:'Cuenta Creada Correctamente',
    mensaje:'Hemos Enviado un Email de Confirmacion,presiona en el enlace'
  })
}

//Funcion que comprueba una cuenta

const confirmar=async(req,res)=>{
    const {token}=req.params
    
    //Verificar si el token es valido
    const usuario = await Usuario.findOne({where:{token}})

    if(!usuario){
        return res.render('auth/confirmar-cuenta',{
            pagina:'Error al confirmar tu cuenta',
            mensaje:'Hubo un error al confirmar tu cuenta,intenta de nuevo',
            error:true
        })
    }

    //Confirmar la cuenta
    usuario.token=null
    usuario.confirmado=true
    await usuario.save()

    res.render('auth/confirmar-cuenta',{
        pagina:'Cuenta Confirmada',
        mensaje:'La cuenta se confirmo Correctamente'
    })
}

const formularioOlvidePassword=(req,res)=>{
    res.render('auth/olvide-password',{
        pagina:'Recupera tu acceso a Bienes raices',
        csrfToken : req.csrfToken()
    })
}

const resetPassword = async (req,res) => {
 //Validacion 
 await check('email').isEmail().withMessage('Eso no parece un Email').run(req)

 let resultado=validationResult(req)

 //Verificacion de que el resultado este vacio
 if(!resultado.isEmpty()){
     return res.render('auth/olvide-password',{
            pagina:'Crear Cuenta',
            csrfToken : req.csrfToken(),
            errores: resultado.array()
        }) 
    }

    const { email } = req.body

    const usuario = await Usuario.findOne({where: {email}})

    if(!usuario){
        console.log(req.body.email);
        return res.render('auth/olvide-password',{
               pagina:'Recupera tu acceso a Bienes Raices ',
               csrfToken : req.csrfToken(),
               errores: [{msg: 'El email no Pertenece a ningun usuario'}]
           }) 
       }
    
    //Generar un token 
    usuario.token = generarId()
    await usuario.save()

    //Enviar un email
    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    })

    //Mostrar mensaje de confirmacion
    res.render('templates/mensaje',{
        pagina:'Reestablece tu password',
        mensaje: 'Hemos enviado un email con las instrucciones'
    })
}

const comprobarToken = async (req,res) =>{

    const { token } =req.params

    const usuario = await Usuario.findOne({where: {token}})
    if(!usuario) {
        return res.render('auth/confirmar-cuenta',{
            pagina: 'Reestablece tu password',
            mensaje: 'Hubo un error al validar tu informacion,intenta de nuevo',
            error: true
        })
    }

    //Mostrar formulario para modificar el password
    res.render('auth/reset-password',{
        pagina: 'Reestablece tu password',
        csrfToken: req.csrfToken()
    })
}

const nuevoPassword = async (req,res) =>{

    //Validar Password
    await check('password').isLength({ min:6}).withMessage('El Password debe de ser de al menos 6 caracteres').run(req)
    let resultado = validationResult(req)

    //Verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        //Errores
        return res.render('auth/reset-password',{
            pagina: 'Reestablecer tu Password',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    const { token } = req.params
    const { password } = req.body

    //Identificar quien hace el cambio
    const usuario = await Usuario.findOne({where: {token}})

    //Hashear el nuevo password
        const salt = await bcrypt.genSalt(10)
        usuario.password = await bcrypt.hash( password, salt)
        usuario.token = null
        
        await usuario.save()

        res.render('auth/confirmar-cuenta',{
            pagina: 'Password Reestablecido',
            mensaje: 'El Password se guardo correctamente'
        })
}

export {
    formularioLogin,
    autenticar,
    formularioRegistro,
    formularioOlvidePassword,
    registrar,
    confirmar,
    resetPassword,
    comprobarToken,
    nuevoPassword
}