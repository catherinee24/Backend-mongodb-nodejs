'use strict'

const Proyecto = require('../models/proyecto')
const fs = require('fs')
var path = require('path')


var controller = {
    home: function (req, res) {
        return res.status(200).send({
            msg: 'Soy the home page',
        })
    },

    test: function (req, res) {
        return res.status(200).send({
            msg: 'Soy el controlador test',
        })
    },

    // Metodo para guardar un nuevo proyecto en la base de datos (post)
    saveProyecto: function (req, res) {
        var proyecto = new Proyecto()

        var params = req.body
        proyecto.name = params.name
        proyecto.description = params.description
        proyecto.author = params.author
        proyecto.langs = params.langs
        proyecto.year = params.year
        proyecto.img = null

        // para guardar este proyecto a la base de datos
        proyecto.save((err, proyectoStored) => {
            if (err)
                return res
                    .status(500)
                    .send({ msg: 'Error al guardar el documento.' })

            if (!proyectoStored)
                return res
                    .status(404)
                    .send({ msg: 'No se ha podido guardar el documento.' })

            // si todo va bien enviamos
            return res.status(200).send({ proyecto: proyectoStored })
        })

        // return res.status(200).send({
        //     proyecto: proyecto,
        //     msg: 'method saveProyecto'
        // })
    },

    // metodo para listar proyectos del portafolio
    getProyectos: function (req, res) {
        var proyectoId = req.params.id

        // esta condicion la hemos hecho porque es opcional el id en la ruta
        if (proyectoId == null)
            return res.status(404).send({ msg: 'no se encuentra el proyecto' })

        //buscar proyecto en la base de datos
        Proyecto.findById(proyectoId, (err, project) => {
            if (err)
                return res
                    .status(500)
                    .send({ msg: 'error al delvolver los datos' })

            if (!project)
                return res
                    .status(404)
                    .send({ msg: 'no se encuentra el project' })

            return res.status(200).send({ project })
        })
    },

    // Devolver listados de proyectos
    getListProyecto: function (req, res) {
        // el sort nos ordena de mayor a menor nuestros proyectos!
        //.sort(-year)
        Proyecto.find({}).exec((err, projects) => {
            if (err)
                return res
                    .status(500)
                    .send({ msg: 'error al delvolver los datos' })

            if (!projects)
                return res
                    .status(404)
                    .send({ msg: 'no se encuentra los projects' })

            return res.status(200).send({ projects })
        })
    },

    // actualizar datos del proyecto (put)
    updateProyecto: function (req, res) {
        var proyectoId = req.params.id
        var update = req.body

        Proyecto.findByIdAndUpdate(
            proyectoId,
            update,
            { new: true },
            (err, projectUpdated) => {
                if (err)
                    return res.status(500).send({ msg: 'error al actualizar' })

                if (!projectUpdated)
                    return res.status(404).send({
                        msg: 'no se encuentra el proyeto para actualizar',
                    })

                return res.status(200).send({ proyecto: projectUpdated })
            }
        )
    },

    // eliminar proyectos de la base de datos (delete)
    deleteProyecto: function (req, res) {
        var proyectoId = req.params.id

        Proyecto.findByIdAndDelete(
            proyectoId,
            { new: true },
            (err, projectDeleted) => {
                if (err)
                    return res.status(500).send({ msg: 'error al eliminar' })

                if (!projectDeleted)
                    return res.status(404).send({
                        msg: 'no se encuentra el proyeto para eliminar',
                    })

                return res.status(200).send({ proyecto: projectDeleted })
            }
        )
    },

    // subir imagenes (post)
    uploadImage: function (req, res) {
        var proyectoId = req.params.id
        var fileName = 'Imagen no subida...'

        if (req.files) {
            var filePath = req.files.image.path
            var fileSplit = filePath.split('\\')
            var fileName = fileSplit[1]
            var extSplit = fileName.split('.')
            var fileExt = extSplit[1]

            if (
                fileExt == 'jpg' ||
                fileExt == 'png' ||
                fileExt == 'jpeg' ||
                fileExt == 'gif'
            ) {
                Proyecto.findByIdAndUpdate(
                    proyectoId,
                    { img: fileName },
                    { new: true },
                    (err, projectUpdated) => {
                        if (err)
                            return res
                                .status(500)
                                .send({ mensaje: 'la imagen no se ha subido' })

                        if (!projectUpdated)
                            return res
                                .status(404)
                                .send({ mensaje: 'El proyecto no existe' })

                        return res.status(200).send({
                            proyecto: projectUpdated,
                        })
                    }
                )
            } else {
                fs.unlink(filePath, (err)=>{
                    return res.status(200).send({
                        msg: 'la extension no es valida'
                    })
                })
            }
        } else {
            return res.status(200).send({
                msg: fileName,
            })
        }
    },

    getImageFile: function (req,res) {
        var file = req.params.image;
        var path_file = './uploads/'+file;
        
        fs.access(path_file, fs.constants.F_OK, (err) => {
            if(err){

                return res.status(200).send({message: 'No existe la imagen'});
                
            }else{
                return res.sendFile(path.resolve(path_file));
            }
        });
    }
}

module.exports = controller
