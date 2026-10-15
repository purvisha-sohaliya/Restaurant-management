import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AUTH_ROUTE, COMMON_ROUTE } from "../Constant/RoutesConstant";
import { ROLES } from "../Constant/CommonConstant";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
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
        const res = await login(values);
        if (!res.success) {
          toast.error("Invalid email or password!");
          return;
        }
        const user = res.data;
        setUser(user);
        toast.success("Login successful!");
        const from = location.state?.from;

        if (from?.pathname === COMMON_ROUTE.SUBSCRIPTIONPLAN) {
          navigate(COMMON_ROUTE.SUBSCRIPTIONPLAN, {
            state: from.state,
            replace: true,
          });
          return;
        }

        if (from?.pathname) {
          navigate(from.pathname, {
            state: from.state,
            replace: true,
          });
          return;
        }
        if (user.role === ROLES.OWNER) {
          const subscription = user.subscription;

          if (
            subscription?.plan === "trial" &&
            subscription?.status === "active" &&
            subscription?.trial_end_date &&
            new Date(subscription.trial_end_date) > new Date()
          ) {
            navigate(COMMON_ROUTE.DASHBOARD, { replace: true });
          } else {
            navigate(COMMON_ROUTE.SUBSCRIPTIONPLAN, { replace: true });
          }
          return;
        }

        if (
          user.role === ROLES.MANAGER ||
          user.role === ROLES.WAITER ||
          user.role === ROLES.CASHIER ||
          user.role === ROLES.KITCHEN
        ) {
          navigate(COMMON_ROUTE.DASHBOARD, { replace: true });
          return;
        }

      } catch (err) {
        toast.error("Invalid email or password!");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="login-wrapper min-vh-100 d-flex justify-content-center align-items-center">
      <div className="login-card">
        <div className="text-center">
          <h2>Restaurant POS</h2>
          <p className="text-muted">Sign in to continue</p>
        </div>
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

        <div className="mt-3 text-center">
          <p className="m-0">Don't have an account? <Link to={AUTH_ROUTE.REGISTER}>Sign up</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;