import express from "express";
import { body } from "express-validator";
import { admin, crear,guardar } from "../controllers/propiedadController.js";

const router = express.Router()

router.get('/mis-propiedades', admin)
router.get('/propiedades/crear', crear)
router.post('/propiedades/crear', 
    body('titulo').notEmpty().withMessage('El titulo del Anuncio es obligatorio'),
    body('descripcion').notEmpty().withMessage('La descripcion no Puede ir Vacia')
    .isLength({max:200}).withMessage('La descripcion es muy larga'),
    body('categoria').isNumeric().withMessage('Selecciona una Categoria'),
    body('precio').isNumeric().withMessage('Selecciona un rango de precios'),
    body('habitaciones').isNumeric().withMessage('Selecciona la cantidad de Habitaciones'),
    body('estacionamiento').isNumeric().withMessage('Selecciona la cantidad de Estacionamientos'),
    body('wc').isNumeric().withMessage('Selecciona la cantidad de Baños'),
    body('calle').notEmpty().withMessage('Ubica la propiedad en el Mapa')
    ,guardar)

export default router