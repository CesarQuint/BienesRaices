import { check,validationResult  } from 'express-validator'
import Usuario from '../models/Usuario.js'
import {generarId} from '../helpers/token.js'
import { emailRegistro } from '../helpers/emails.js'


const formularioLogin=(req,res)=>{
    res.render('auth/login',{
        pagina:'Iniciar Sesion'
    })
}

const formularioRegistro=(req,res)=>{
    res.render('auth/registro',{
        pagina:'Crear Cuenta'
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

const formularioOlvidePassword=(req,res)=>{
    res.render('auth/olvide-password',{
        pagina:'Recupera tu acceso a Bienes raices'
    })
}


export {
    formularioLogin,
    formularioRegistro,
    formularioOlvidePassword,
    registrar
}