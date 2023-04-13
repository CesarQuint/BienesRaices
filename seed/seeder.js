import { exit } from 'node:process'
import categorias from './categoria.js'
import precios from './precios.js'
import Categoria from '../models/Categoria.js'
import Precio from '../models/Precio.js'
import db from '../config/db.js'

const importarDatos = async () => {
    try {
        //Autenticar
        await db.authenticate()

        //Generar las Columnas
        await db.sync()

        //Insertar los datos
        await Promise.all([Categoria.bulkCreate(categorias),
                            Precio.bulkCreate(precios)])

        console.log('Datos Importados Correctamente')
        exit()

    } catch (error) {
        console.log(error);
        //Cuando al exit se le pasa un valor 1 significa que hubo un error en la operacion ,cuando es 0 el proceso salio bien
        exit(1)
    }
}

if(process.argv[2] === '-i'){
    importarDatos()
}