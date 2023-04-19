import { exit } from 'node:process'
import categorias from './categoria.js'
import precios from './precios.js'
import usuarios from './usuarios.js'
import db from '../config/db.js'
import { Categoria, Precio, Usuario } from '../models/index.js'

const importarDatos = async () => {
    try {
        //Autenticar
        await db.authenticate()

        //Generar las Columnas
        await db.sync()

        //Insertar los datos
        await Promise.all([Categoria.bulkCreate(categorias),
                            Precio.bulkCreate(precios),
                            Usuario.bulkCreate(usuarios)])

        console.log('Datos Importados Correctamente')
        exit()

    } catch (error) {
        console.log(error);
        //Cuando al exit se le pasa un valor 1 significa que hubo un error en la operacion ,cuando es 0 el proceso salio bien
        exit(1)
    }
}

const eliminarDatos = async () => {
    try {
        //*Forma de hacer eleminicion de informacion en las tablas  
        // await Promise.all([
        //     Categoria.destroy({where: {},truncate:true}),
        //     Precio.destroy({where: {},truncate:true})
        // ])

        await db.sync({ force: true })
        console.log('Datos Eliminados Correctamente');
        exit()
    } catch (error) {
        
    }
}

if(process.argv[2] === '-i'){
    importarDatos()
}

if(process.argv[2] === '-e'){
    eliminarDatos()
}