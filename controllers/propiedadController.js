import { validationResult } from "express-validator" 
import Precio from "../models/Precio.js"
import Categoria from "../models/Categoria.js"


const admin = (req,res) => {
    res.render('propiedades/admin', {
        pagina: 'Mis Propiedades',
        barra: true
    })
}

const crear = async (req,res) => {
    //Consultar Modelo de Precio y Categoria 

    const [categorias, precios] = await Promise.all([Categoria.findAll(),Precio.findAll()])

    res.render('propiedades/crear', {
        pagina: 'Crear Propiedad',
        barra: true,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos
    })
}

const guardar = async (req,res) => {

    //Validacion
    let resultado = validationResult(req)

    if(!resultado.isEmpty()){
        //Consultar Modelo de Precio y Categorias
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])

        return res.render('propiedades/crear',{
            pagina: 'Crear Propiedad',
            barra: true,
            categorias,
            csrfToken: req.csrfToken(),
            precios,
            errores: resultado.array(),
            datos: req.body
        })
    }

    
}

export {
    admin,
    crear,
    guardar
}