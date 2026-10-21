import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { createMenuItem, getMenuItemById, updateMenuItem, } from "../../../services/menuItemService";
import { getCategories } from "../../../services/categoryService";
import { SUB_ADMIN_ROUTE } from "../../../Constant/RoutesConstant";
import { FaUtensils, FaSave } from "react-icons/fa";
import { toast } from "react-toastify";

function MenuForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [imageName, setImageName] = useState("No file chosen");
  const [imagePreview, setImagePreview] = useState(null);

 const validationSchema = Yup.object({
    item_name: Yup.string()
      .trim()
      .required("Menu name is required"),

    category_id: Yup.string()
      .required("Please select a category"),

    price: Yup.number()
      .typeError("Price must be a number")
      .required("Price is required")
      .moreThan(0, "Price must be greater than 0"),

    status: Yup.string()
      .oneOf(["active", "inactive"], "Please select a valid status")
      .required("Status is required"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      item_name: "",
      category_id: "",
      price: "",
      description: "",
      image: null,
      status: "active",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append("item_name", values.item_name);
        formData.append("category_id", values.category_id);
        formData.append("price", values.price);
        formData.append("description", values.description);
        formData.append("status", values.status);

        if (values.image && typeof values.image !== "string") {
          formData.append("image", values.image);
        }
        let res;
        if (id) {
          res = await updateMenuItem(id, formData);
        } else {
          res = await createMenuItem(formData);
        }
        if (res?.success) {
          toast.success(
            id
              ? "Menu item updated successfully!"
              : "Menu item created successfully!"
          );
          navigate(SUB_ADMIN_ROUTE.MENULIST);
        }
      } catch (err) {
        toast.error("menu already exists!");
      }
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryRes = await getCategories();

        setCategories(categoryRes.data || []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchMenu = async () => {
      try {
        const res = await getMenuItemById(id);
        const data = res.data;

        formik.setValues({
          item_name: data.item_name || "",
          category_id: data.category_id?._id || "",
          price: data.price || "",
          description: data.description || "",
          image: data.image || "",
          status: data.status || "active",
        });
        const imageUrl = res.data.image;
        if (imageUrl) {
          const fileName = imageUrl.split("/").pop();
          setImageName(fileName);
          setImagePreview(imageUrl);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchMenu();
  }, [id]);

  return (
    <div className="container py-4 d-flex justify-content-center">
      <div className="form-card shadow-lg border-0 rounded-4 p-4" >
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="bg-blue text-white p-3 rounded-circle">
            <FaUtensils />
          </div>
          <div>
            <h4 className="fw-bold mb-1">{id ? "Edit Menu Item" : "Create Menu Item"}</h4>
            <p className="text-muted small mb-0">
              Manage restaurant menu
            </p>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit}>
          {/* Menu Name */}
          <input type="text" name="item_name" placeholder="Menu Name"
            className={`form-control mb-1 ${formik.touched.item_name && formik.errors.item_name
              ? "is-invalid" : ""}`}
            value={formik.values.item_name} onChange={formik.handleChange} onBlur={formik.handleBlur}
          />
          {formik.touched.item_name && formik.errors.item_name && (
            <div className="text-danger small mb-3">
              {formik.errors.item_name}
            </div>
          )}

          {/* Category */}
          <select name="category_id"
            className={`form-select mb-1 ${formik.touched.category_id && formik.errors.category_id
              ? "is-invalid" : ""}`}
            value={formik.values.category_id} onChange={formik.handleChange} onBlur={formik.handleBlur}>
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.category_name}
              </option>
            ))}
          </select>
          {formik.touched.category_id && formik.errors.category_id && (
            <div className="text-danger small mb-3">
              {formik.errors.category_id}
            </div>
          )}

          {/* Price */}
          <input type="number" name="price" placeholder="Price" min="0.01"
            className={`form-control mb-1 ${formik.touched.price && formik.errors.price
              ? "is-invalid" : ""}`}
            value={formik.values.price} onChange={formik.handleChange} onBlur={formik.handleBlur} />
          {formik.touched.price && formik.errors.price && (
            <div className="text-danger small mb-3">
              {formik.errors.price}
            </div>
          )}

          {/* Description */}
          <textarea name="description" placeholder="Description" className="form-control mb-3" rows="3"
            value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur} />

          {/* Image */}
          <div className="input-group mb-3">
            <label htmlFor="image" className="btn btn-outline-secondary">
              Choose File
            </label>

            <input id="image" type="file" accept="image/*" hidden
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  formik.setFieldValue("image", file);
                  setImageName(file.name);
                }
              }} />

            <input type="text" className="form-control" value={imageName} readOnly />
          </div>

          {/* Status */}
          <select name="status" className={`form-select mb-1 ${formik.touched.status && formik.errors.status
            ? "is-invalid" : ""}`}
            value={formik.values.status}onChange={formik.handleChange}onBlur={formik.handleBlur}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {formik.touched.status && formik.errors.status && (
            <div className="text-danger small mb-3">
              {formik.errors.status}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn bg-blue text-white w-100"
            disabled={formik.isSubmitting}>
            <FaSave className="me-2" />
            {formik.isSubmitting
              ? "Saving..."
              : id
                ? "Update Menu Item"
                : "Save Menu Item"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default MenuForm;