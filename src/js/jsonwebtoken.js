import jwt from 'jsonwebtoken'

const generateToken = async(json, privateKey)=>{
    return jwt.sign({ data: json }, privateKey, { expiresIn: '2h' });
}

const verifyToken = async(token, privateKey)=>{
    try{ return jwt.verify(token, privateKey) }catch(err){ return err }
}

export {generateToken, verifyToken}