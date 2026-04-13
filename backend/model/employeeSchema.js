// EMployee management system user schema
import mongoose from "mongoose";

const employeeSchema = {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "co-admin", "employee"],
    default: "employee",
    // authority: {
    //   admin: 3,
    //   coAdmin: 2,
    //   employee: 1,
    // },
    //a feature that checks whether the user has security access or not for instance for first time login has to be given acceptance by admin or co-admin,
    // isActive: { type: Boolean, default: false },
    //a feature that has to check the role that will let user go for certain routes or not for instance only admin can access the employee management routes and co-admin can access the order management routes and employee can access the inventory management routes
  },
};

const employee = mongoose.model("Employee", employeeSchema);
export default employee;
