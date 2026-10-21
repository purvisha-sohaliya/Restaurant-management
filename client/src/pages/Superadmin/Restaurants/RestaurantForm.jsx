import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { COMMON_ROUTE } from "../../../Constant/RoutesConstant";
import { FaSave } from "react-icons/fa";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createRestaurant, getRestaurantById, updateRestaurant } from "../../../services/restaurantService";
import { toast } from "react-toastify";

function RestaurantForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const owner_id = location.state?.owner_id;
    const [initialValues, setInitialValues] = useState({
        restaurant_name: "",
        email: "",
        phone: "",
        city: "",
        address: "",
        country: "",
        logo: null
    });

    const validationSchema = Yup.object({
        restaurant_name: Yup.string().required(
            "Restaurant name is required"
        ),
        email: Yup.string()
            .email("Invalid email")
            .required("Email is required"),
        phone: Yup.string()
            .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
            .required("Phone is required"),
        city: Yup.string().required("City is required"),
        address: Yup.string().required("Address is required"),
        country: Yup.string().required("Country is required"),
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues,
        validationSchema,

        onSubmit: async (values, { resetForm }) => {
            try {
                if (!owner_id && !id) {
                    toast.error("Owner information not found");
                    return;
                }

                const formData = new FormData();

                formData.append("restaurant_name", values.restaurant_name);
                formData.append("email", values.email);
                formData.append("phone", values.phone);
                formData.append("address", values.address);
                formData.append("city", values.city);
                formData.append("country", values.country);

                if (owner_id) {
                    formData.append("owner_id", owner_id);
                }
                if (values.logo) {
                    formData.append("logo", values.logo);
                }

                let res;

                if (id) {
                    res = await updateRestaurant(id, formData);
                } else {
                    res = await createRestaurant(formData);
                }

                if (res.success) {
                    toast.success(res.message);
                    resetForm();

                    if (!id) {
                        // New restaurant created
                        navigate(COMMON_ROUTE.SUBSCRIPTIONPLAN, {
                            state: {
                                owner_id,
                                restaurant_id: res.data._id,
                                restaurant_name: res.data.restaurant_name,
                            },
                        });
                    }
                }

            } catch (error) {
                console.error(error);

                toast.error(
                    error.response?.data?.message ||
                    "Something went wrong"
                );
            }
        },
    });

    useEffect(() => {
        if (!id) return;

        const fetchRestaurant = async () => {
            try {
                const res = await getRestaurantById(id);

                setInitialValues({
                    restaurant_name: res.data.restaurant_name || "",
                    email: res.data.email || "",
                    phone: res.data.phone || "",
                    city: res.data.city || "",
                    address: res.data.address || "",
                    country: res.data.country || "",
                });
            } catch (err) {
                console.error(err);
            }
        };

        fetchRestaurant();
    }, [id]);


    return (
        <div className="container-fluid py-3">

            <div className="row justify-content-center">
                <div className="col-12 col-lg-8 col-xl-7">

                    {/* Page Heading */}
                    <div className="mb-3">
                        <h3 className="fw-bold mb-1">
                            {id ? "Edit Restaurant" : "Create Restaurant"}
                        </h3>

                        <p className="text-muted mb-0">
                            {id
                                ? "Manage and update your restaurant details."
                                : "Set up your restaurant by completing the information below."}
                        </p>
                    </div>

                    <form onSubmit={formik.handleSubmit}>

                        <div className="card border-0 shadow-sm rounded-5">
                            <div className="card-body p-3 p-md-3">

                                {/* Basic Information */}
                                <div className="mb-2 pb-2 border-bottom">
                                    <h6 className="fw-bold mb-1">
                                        Basic Information
                                    </h6>
                                    <p className="text-muted small mb-2">
                                        Restaurant name and contact details
                                    </p>
                                </div>

                                {/* Restaurant Name */}
                                <div className="mb-2">
                                    <label
                                        htmlFor="restaurant_name"
                                        className="form-label fw-semibold" >
                                        Restaurant Name
                                    </label>

                                    <input
                                        id="restaurant_name"
                                        type="text"
                                        name="restaurant_name"
                                        placeholder="e.g. The Royal Kitchen"
                                        className={`form-control form-control-lg fs-6 rounded-3 ${formik.touched.restaurant_name &&
                                                formik.errors.restaurant_name
                                                ? "is-invalid"
                                                : ""
                                            }`}
                                        value={formik.values.restaurant_name}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />

                                    <div className="invalid-feedback">
                                        {formik.errors.restaurant_name}
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="mb-2">
                                    <label
                                        htmlFor="email"
                                        className="form-label fw-semibold"
                                    >
                                        Email Address
                                    </label>

                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="restaurant@example.com"
                                        className={`form-control form-control-lg fs-6 rounded-3 ${formik.touched.email &&
                                                formik.errors.email
                                                ? "is-invalid"
                                                : ""
                                            }`}
                                        value={formik.values.email}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />

                                    <div className="invalid-feedback">
                                        {formik.errors.email}
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="mb-2">
                                    <label
                                        htmlFor="phone"
                                        className="form-label fw-semibold"
                                    >
                                        Phone Number
                                    </label>

                                    <input
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        placeholder="Enter contact number"
                                        className={`form-control form-control-lg fs-6 rounded-3 ${formik.touched.phone &&
                                                formik.errors.phone
                                                ? "is-invalid"
                                                : ""
                                            }`}
                                        value={formik.values.phone}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />

                                    <div className="invalid-feedback">
                                        {formik.errors.phone}
                                    </div>
                                </div>

                                {/* Location Section */}
                                <div className="mb-2 pb-2 border-bottom">
                                    <h6 className="fw-bold mb-1">
                                        Location Details
                                    </h6>
                                    <p className="text-muted small mb-2">
                                        Where is your restaurant located?
                                    </p>
                                </div>

                                {/* City */}
                                <div className="mb-2">
                                    <label
                                        htmlFor="city"
                                        className="form-label fw-semibold"
                                    >
                                        City
                                    </label>

                                    <input
                                        id="city"
                                        type="text"
                                        name="city"
                                        placeholder="Enter city"
                                        className={`form-control form-control-lg fs-6 rounded-3 ${formik.touched.city &&
                                                formik.errors.city
                                                ? "is-invalid"
                                                : ""
                                            }`}
                                        value={formik.values.city}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />

                                    <div className="invalid-feedback">
                                        {formik.errors.city}
                                    </div>
                                </div>

                                {/* Country */}
                                <div className="mb-2">
                                    <label
                                        htmlFor="country"
                                        className="form-label fw-semibold"
                                    >
                                        Country
                                    </label>

                                    <select
                                        id="country"
                                        name="country"
                                        className={`form-select form-select-lg fs-6 rounded-3 ${formik.touched.country &&
                                                formik.errors.country
                                                ? "is-invalid"
                                                : ""
                                            }`}
                                        value={formik.values.country}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    >
                                        <option value="">Select Country</option>
                                        <option value="India">India</option>
                                        <option value="United States">United States</option>
                                        <option value="United Kingdom">United Kingdom</option>
                                        <option value="Canada">Canada</option>
                                        <option value="Australia">Australia</option>
                                        <option value="Germany">Germany</option>
                                        <option value="France">France</option>
                                        <option value="Singapore">Singapore</option>
                                    </select>

                                    <div className="invalid-feedback">
                                        {formik.errors.country}
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="mb-2">
                                    <label
                                        htmlFor="address"
                                        className="form-label fw-semibold"
                                    >
                                        Full Address
                                    </label>

                                    <textarea
                                        id="address"
                                        name="address"
                                        rows={4}
                                        placeholder="Street, building, area, landmark..."
                                        className={`form-control rounded-3 ${formik.touched.address &&
                                                formik.errors.address
                                                ? "is-invalid"
                                                : ""
                                            }`}
                                        value={formik.values.address}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />

                                    <div className="invalid-feedback">
                                        {formik.errors.address}
                                    </div>
                                </div>

                                {/* Logo */}
                                <div className="mb-2">
                                    <label
                                        htmlFor="logo"
                                        className="form-label fw-semibold"
                                    >
                                        Restaurant Logo
                                    </label>

                                    <input
                                        id="logo"
                                        type="file"
                                        name="logo"
                                        accept="image/png,image/jpeg,image/jpg,image/webp"
                                        className="form-control form-control-lg fs-6 rounded-3"
                                        onChange={(e) => {
                                            const file = e.currentTarget.files[0];
                                            formik.setFieldValue("logo", file || null);
                                        }}
                                    />

                                    <div className="form-text">
                                        Upload PNG, JPG or WEBP image.
                                    </div>

                                    {formik.values.logo instanceof File && (
                                        <div className="d-flex align-items-center gap-3 mt-3 bg-light border rounded-3">
                                            <img
                                                src={URL.createObjectURL(formik.values.logo)}
                                                alt="Restaurant Logo"
                                                width="75"
                                                height="75"
                                                className="rounded-3 border bg-white object-fit-contain"
                                            />

                                            <div className="overflow-hidden">
                                                <p className="fw-semibold small mb-1 text-truncate">
                                                    {formik.values.logo.name}
                                                </p>
                                                <span className="badge bg-success-subtle text-success">
                                                    Selected
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="border-top pt-3 mt-4">
                                    <div className="d-flex justify-content-end gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-light border px-3 rounded-3"
                                            onClick={() => window.history.back()}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="btn btn-primary px-3 rounded-3"
                                            disabled={formik.isSubmitting}
                                        >
                                            {formik.isSubmitting
                                                ? "Saving..."
                                                : id
                                                    ? "Update Restaurant"
                                                    : "Create Restaurant"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default RestaurantForm;