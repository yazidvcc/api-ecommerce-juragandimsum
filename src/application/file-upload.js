import expressFileUpload from 'express-fileupload';

const fileUpload = expressFileUpload({
    limits: {
        fileSize: 2 * 1024 * 1024
    },
    limitHandler: (req, res, next) => {
        return res.status(413).json({
            errors: 'File terlalu besar! Maksimal ukuran adalah 2MB.'
        });
    },
    abortOnLimit: true
});

export default fileUpload;