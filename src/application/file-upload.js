import expressFileUpload from 'express-fileupload';

const fileUpload = expressFileUpload({
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    limitHandler: (req, res, next) => {
        return res.status(413).json({
            errors: 'File terlalu besar! Maksimal ukuran adalah 10MB.'
        });
    },
    abortOnLimit: true
});

export default fileUpload;