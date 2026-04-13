const jwt = require("jsonwebtoken");
const employee = require("../model/employeeSchema");

const auth = async (req, res, next) => {
    try {
        //get token froom header 
        const token = req.header("Authorization").replace("Bearer ", "");
        
        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //find user by id
        const user = await employee.findById(decoded.id);
    }
}