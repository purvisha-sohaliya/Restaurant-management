
import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

import { COMMON_ROUTE, SUPER_ADMIN_ROUTE } from "../Constant/RoutesConstant";
import { ROLES } from "../Constant/CommonConstant";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },

    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),

      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),

    onSubmit: async (values, { setSubmitting }) => {
      try {
        console.log("LOGIN VALUES:", values);

        const res = await login(values);

        console.log("LOGIN RESPONSE:", res);

        if (!res.success) {
          console.log("LOGIN FAILED:", res.message);
          return;
        }

        const user = res.data;

        console.log("LOGGED USER:", user);

        setUser(user);

        if (user.role === ROLES.SUPER_ADMIN) {
          navigate(SUPER_ADMIN_ROUTE.RESTOURANTSLIST, { replace: true });
          return;
        }

        if (
          user.role === ROLES.OWNER ||
          user.role === ROLES.MANAGER ||
          user.role === ROLES.WAITER ||
          user.role === ROLES.CASHIER ||
          user.role === ROLES.KITCHEN
        ) {
          navigate(COMMON_ROUTE.DASHBOARD, { replace: true });
          return;
        }

        console.log("UNKNOWN ROLE:", user.role);

      } catch (err) {
        console.error(
          "LOGIN ERROR:",
          err.response?.data || err.message
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="login-wrapper min-vh-100 d-flex justify-content-center align-items-center">

      <div className="login-card bg-white text-center shadow">

        <h2>Restaurant POS</h2>

        <p>Sign in to continue</p>

        <form onSubmit={formik.handleSubmit}>

          {/* EMAIL */}
          <div className="mb-3">

            <input
              type="email"
              name="email"
              className={`form-control ${formik.touched.email && formik.errors.email
                ? "is-invalid"
                : ""
                }`}
              placeholder="Email Address"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />

            {formik.touched.email && formik.errors.email && (
              <div className="invalid-feedback">
                {formik.errors.email}
              </div>
            )}

          </div>

          {/* PASSWORD */}
          <div className="mb-3">

            <input
              type="password"
              name="password"
              className={`form-control ${formik.touched.password && formik.errors.password
                ? "is-invalid"
                : ""
                }`}
              placeholder="Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />

            {formik.touched.password && formik.errors.password && (
              <div className="invalid-feedback">
                {formik.errors.password}
              </div>
            )}

          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="btn btn-dark w-100"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default Login;

