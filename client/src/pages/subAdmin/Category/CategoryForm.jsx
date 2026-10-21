import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { createCategory, getCategoryById, updateCategory } from "../../../services/categoryService";
import { SUB_ADMIN_ROUTE } from "../../../Constant/RoutesConstant";
import { FaTags, FaImage, FaSave } from "react-icons/fa";
import { toast } from "react-toastify";

function CategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [imageName, setImageName] = useState("No file chosen");
  const [imagePreview, setImagePreview] = useState(null);
   // validation
  const validationSchema = Yup.object({
    category_name: Yup.string()
      .trim()
      .min(2, "Category name must be at least 2 characters")
      .required("Category name is required"),

    status: Yup.string()
      .oneOf(["active", "inactive"], "Please select a valid status")
      .required("Status is required"),
  });

  //  Formik
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      category_name: "",
      description: "",
      status: "active",
      image: null,

    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append("category_name", values.category_name);
        formData.append("description", values.description || "");
        formData.append("status", values.status);
        if (values.image && typeof values.image !== "string") {
          formData.append("image", values.image);
        }
        let res;
        if (id) {
          res = await updateCategory(id, formData);
        } else {
          res = await createCategory(formData);
        }
        if (res?.success) {
          toast.success(
            id
              ? "Category updated successfully!"
              : "Category created successfully!"
          );
          navigate(SUB_ADMIN_ROUTE.CATEGORYLIST);
        }
      } catch (err) {
        toast.error(
          err?.response?.data?.message ||
          "Category already exists!"
        );
      }
    }
  });
  // fetch category for edit
  useEffect(() => {
    if (!id) return;
    const fetchCategory = async () => {
      try {
        const res = await getCategoryById(id);
        formik.setValues({
          category_name: res.data.category_name || "",
          description: res.data.description || "",
          status: res.data.status || "active",
          image: res.data.image || null,
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

    fetchCategory();
  }, [id]);

  return (
    <div className="container py-4 d-flex justify-content-center">
      <div className="form-card shadow-lg border-0 rounded-4 p-4" >
        {/* HEADER */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="bg-blue text-white p-3 rounded-circle">
            <FaTags />
          </div>

          <div>
            <h4 className="fw-bold mb-1">{id ? "Edit Category" : "Create Category"}</h4>
            <p className="text-muted small mb-0">Manage categories</p>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={formik.handleSubmit}>
          {/* Category Name */}
          <input name="category_name" type="text"
            className={`form-control mb-1 ${formik.touched.category_name && formik.errors.category_name
              ? "is-invalid" : ""}`} placeholder="Category Name" value={formik.values.category_name}
            onChange={formik.handleChange} onBlur={formik.handleBlur} />

          {formik.touched.category_name && formik.errors.category_name && (
            <div className="text-danger small mb-3">
              {formik.errors.category_name}
            </div>
          )}

          {/* Description */}
          <textarea name="description" className="form-control mb-3" placeholder="Description" rows="3"
            value={formik.values.description}onChange={formik.handleChange}onBlur={formik.handleBlur}/>

          {/* Image */}
          <div className="input-group mb-3">
            <label htmlFor="image" className="btn btn-outline-secondary">
              Choose File
            </label>

            <input id="image" type="file" accept="image/*"  hidden
              onChange={(e) => { const file = e.target.files[0];
                if (file) {
                  formik.setFieldValue("image", file);
                  setImageName(file.name);
                }
              }}/>

            <input type="text" className="form-control" value={imageName} readOnly/>
          </div>

          {/* Status */}
          <select name="status" className={`form-select mb-1 ${formik.touched.status && formik.errors.status
              ? "is-invalid": ""}`}
            value={formik.values.status} onChange={formik.handleChange} onBlur={formik.handleBlur}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {formik.touched.status && formik.errors.status && (
            <div className="text-danger small mb-3">
              {formik.errors.status}
            </div>
          )}

          {/* Submit */}
          <button type="submit" className="btn bg-blue text-white w-100"disabled={formik.isSubmitting}>
            <FaSave className="me-2" />
            {formik.isSubmitting
              ? "Saving..."
              : id
                ? "Update Category"
                : "Save Category"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CategoryForm;