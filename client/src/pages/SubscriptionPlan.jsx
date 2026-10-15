
import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { getSubscriptionPlans, createSubscriptionPlan, activateSubscription, updateSubscriptionPlan, deleteSubscriptionPlan, } from "../services/subscriptionPlanService";
import { COMMON_ROUTE } from "../Constant/RoutesConstant";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  name: "",
  price: "",
  duration: "monthly",
  duration_days: 30,
  max_staff: 10,
  max_tables: 10,
  features: [],
};

const featureLabels = {
  kitchen: "Kitchen Management",
  inventory: "Inventory Management",
  recipe: "Recipe Management",
  reports: "Reports",
};

function SubscriptionPlan() {
  const { user } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [newPlan, setNewPlan] = useState(initialForm);
  const [restaurantId, setRestaurantId] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [featureInput, setFeatureInput] = useState("");
  const [customFeatures, setCustomFeatures] = useState([]);
  
  const handleAddFeature = () => {
    const feature = featureInput.trim();

    if (!feature) {
      toast.error("Please enter feature name");
      return;
    }

    const exists = customFeatures.some(
      (item) => item.toLowerCase() === feature.toLowerCase()
    );

    if (exists) {
      toast.warning("Feature already exists");
      return;
    }

    setCustomFeatures((prev) => [...prev, feature]);
    setFeatureInput("");
  };

  const handleRemoveFeature = (feature) => {
    setCustomFeatures((prev) =>
      prev.filter((item) => item !== feature)
    );
  };

  const loadPlans = async () => {
    try {
      setLoading(true);

      const response = await getSubscriptionPlans();
      const data = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];

      setPlans(
        data.filter(
          (plan) =>
            plan.status === "active" &&
            plan.is_deleted !== true
        )
      );
    } catch (error) {
      console.error("Fetch plans error:", error.response?.data || error);
      toast.error(
        error.response?.data?.message || "Failed to load subscription plans"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const updateForm = (field, value) => {
    setNewPlan((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDurationChange = (duration) => {
    const days =
      duration === "trial" ? 15 : duration === "monthly" ? 30 : 365;

    setNewPlan((prev) => ({
      ...prev,
      duration,
      duration_days: days,
    }));
  };

  const handleAddPlan = async (e) => {
    e.preventDefault();

    const price = Number(newPlan.price);
    const staff = Number(newPlan.max_staff);
    const tables = Number(newPlan.max_tables);
    const durationDays = Number(newPlan.duration_days);

    if (!newPlan.name.trim()) {
      toast.error("Please enter plan name");
      return;
    }

    if (
      newPlan.price === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      toast.error("Please enter a valid price");
      return;
    }

    if (!Number.isInteger(staff) || staff < 1) {
      toast.error("Maximum staff must be at least 1");
      return;
    }

    if (!Number.isInteger(tables) || tables < 1) {
      toast.error("Maximum tables must be at least 1");
      return;
    }

    if (!Number.isInteger(durationDays) || durationDays < 1) {
      toast.error("Duration must be at least 1 day");
      return;
    }

    const payload = {
      plan_name: newPlan.name.trim(),
      plan_type: newPlan.duration,
      price,
      duration_days: durationDays,
      max_staff: staff,
      max_tables: tables,
      features: customFeatures,
    };

    try {
      setSaving(true);

      const response = editingPlanId
        ? await updateSubscriptionPlan(editingPlanId, payload)
        : await createSubscriptionPlan(payload);

      if (response?.success === false) {
        throw new Error(
          response.message ||
          `Unable to ${editingPlanId ? "update" : "create"} plan`
        );
      }

      toast.success(
        response?.message ||
        (editingPlanId
          ? "Plan updated successfully"
          : "Plan created successfully")
      );

      setShowAddModal(false);
      setEditingPlanId(null);
      setNewPlan({ ...initialForm });
      setCustomFeatures([]);
      setFeatureInput("");

      await loadPlans();
    } catch (error) {
      console.error(
        "Save plan error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to save subscription plan"
      );
    } finally {
      setSaving(false);
    }
  };

  const getDurationText = (plan) => {
    if (plan.plan_type === "trial") {
      return `${plan.duration_days} days`;
    }

    if (plan.plan_type === "monthly") {
      return "month";
    }

    if (plan.plan_type === "yearly") {
      return "year";
    }

    return `${plan.duration_days} days`;
  };

  const handleChoosePlan = (plan) => {
    setSelectedPlan(plan);
    setShowConfirmModal(true);
  };


  const handleConfirmPlan = async () => {
    if (!selectedPlan) {
      toast.error("Please select a plan.");
      return;
    }

    const finalOwnerId = ownerId || user?._id;
    const finalRestaurantId =
      restaurantId || user?.restaurant_id;

    if (!finalOwnerId || !finalRestaurantId || !selectedPlan._id) {
      console.log("Owner ID:", finalOwnerId);
      console.log("Restaurant ID:", finalRestaurantId);
      console.log("Selected Plan:", selectedPlan);

      toast.error("Owner ID, Restaurant ID or Plan ID is missing.");
      return;
    }

    if (selectedPlan.plan_type !== "trial") {
      toast.info("Monthly/Yearly plan માટે પહેલાં payment પૂર્ણ કરો.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        owner_id: finalOwnerId,
        restaurant_id: finalRestaurantId,
        plan_id: selectedPlan._id,
      };

      console.log("Activation Payload:", payload);

      const response = await activateSubscription(payload);



      if (!response?.success) {
        throw new Error(response?.message || "Activation failed");
      }

      toast.success("15 Days Free Trial activated successfully!");
      setShowConfirmModal(false);
      navigate(COMMON_ROUTE.DASHBOARD, { replace: true });
    } catch (error) {
      console.error(
        "Activation error:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Subscription activation failed"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditPlan = (plan) => {
    const features = Array.isArray(plan.features)
      ? plan.features.map((feature) =>
        typeof feature === "string"
          ? feature
          : feature.name
      )
      : Object.entries(plan.features || {})
        .filter(([, enabled]) => enabled)
        .map(([name]) => featureLabels[name] || name);

    setNewPlan({
      name: plan.plan_name || "",
      price: String(plan.price ?? ""),
      duration: plan.plan_type || "monthly",
      duration_days: plan.duration_days || 30,
      max_staff: plan.max_staff || 10,
      max_tables: plan.max_tables || 10,
      features: features,
    });

    setEditingPlanId(plan._id);
    setCustomFeatures(features);
    setFeatureInput("");
    setShowAddModal(true);
  };

  const handleDeletePlan = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subscription plan?"
    );

    if (!confirmed) return;

    try {
      setSaving(true);

      const response = await deleteSubscriptionPlan(id);
      if (response?.success === false) {
        throw new Error(response.message || "Failed to delete plan");
      }
      toast.success(response?.message || "Plan deleted successfully");

      await loadPlans();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete plan");
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="min-vh-100 bg-light py-4 py-lg-5">
      <div className="container">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-5 flex-wrap gap-3">
          <div>
            <h2 className="fw-bold mb-1">Choose Your Plan</h2>
            <p className="text-muted mb-0">
              Select the best plan for your Restaurant POS
            </p>
          </div>

          {user?.role?.toLowerCase() === "super_admin" && (
            <button
              type="button"
              className="btn bg-blue text-white rounded-3 px-4 py-2 fw-semibold"
              onClick={() => setShowAddModal(true)} >
              <FaPlus className="me-2" />
              Add New Plan
            </button>
          )}
        </div>

        {/* Dynamic cards */}

        <div className="row g-4 justify-content-center">
          {loading ? (
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary" />
              <p className="text-muted mt-2">Loading plans...</p>
            </div>
          ) : plans.length > 0 ? (
            plans.map((plan) => {
              const enabledFeatures = Array.isArray(plan.features)
                ? plan.features
                : Object.entries(plan.features || {})
                  .filter(([, enabled]) => enabled)
                  .map(([key]) => featureLabels[key] || key);

              return (
                <div className="col-lg-4 col-md-6" key={plan._id}>
                  <div className="card border-0 shadow-lg h-100">
                    <div className="card-body p-4 text-center d-flex flex-column">

                      {plan.plan_type === "yearly" && (
                        <div className="text-center mb-3">
                          <span className="badge bg-success">
                            BEST VALUE
                          </span>
                        </div>
                      )}

                      <h4 className="fw-bold mb-3">{plan.plan_name}</h4>

                      <div className="mb-4">
                        <span className="display-5 fw-bold">
                          ₹{Number(plan.price).toLocaleString("en-IN")}
                        </span>
                        <span className="text-muted">
                          {" "}/ {getDurationText(plan)}
                        </span>
                      </div>

                      <div className="text-start mb-4">
                        <div className="d-flex mb-3">
                          <FaCheckCircle className="text-success me-2 mt-1" />
                          <span>Maximum Staff: {plan.max_staff}</span>
                        </div>

                        <div className="d-flex mb-3">
                          <FaCheckCircle className="text-success me-2 mt-1" />
                          <span>Maximum Tables: {plan.max_tables}</span>
                        </div>

                        {enabledFeatures.map((feature, index) => (
                          <div className="d-flex mb-3" key={`${feature}-${index}`}>
                            <FaCheckCircle className="text-success me-2 mt-1" />
                            <span>{typeof feature === "string" ? feature : feature.name}</span>
                          </div>
                        ))}

                        {enabledFeatures.length === 0 && (
                          <p className="text-muted small">
                            No additional features configured.
                          </p>
                        )}
                      </div>

                      {/* Buttons fixed at the bottom */}
                      <div className="mt-auto">
                        {user?.role?.toLowerCase() === "super_admin" && (
                          <div className="d-flex gap-2 mb-3">
                            <button
                              type="button"
                              className="btn btn-outline-primary flex-fill"
                              onClick={() => handleEditPlan(plan)}
                            >
                              <FaEdit className="me-2" />
                              Edit
                            </button>

                            <button
                              type="button"
                              className="btn btn-outline-danger flex-fill"
                              onClick={() => handleDeletePlan(plan._id)}
                            >
                              <FaTrash className="me-2" />
                              Delete
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          className={`btn ${plan.plan_type === "trial"
                              ? "btn-dark"
                              : plan.plan_type === "yearly"
                                ? "btn-success"
                                : "btn-outline-dark"
                            } w-100 py-3 fw-bold`}
                          onClick={() => handleChoosePlan(plan)}
                        >
                          {plan.plan_type === "trial"
                            ? "Start Free Trial"
                            : `Choose ${plan.plan_name}`}
                        </button>

                        {plan.plan_type === "trial" && (
                          <p className="text-muted small mt-3 mb-0">
                            No payment required
                          </p>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-12 text-center py-5">
              <h5 className="text-muted">
                No active subscription plans available.
              </h5>
            </div>
          )}
        </div>

      </div>

      {/* Add Plan Modal */}
      {showAddModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4">
              <div className="modal-header px-4 py-3">
                <h5 className="modal-title fw-bold">
                  Add New Subscription Plan
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  disabled={saving}
                  onClick={() => setShowAddModal(false)}
                />
              </div>

              <form onSubmit={handleAddPlan}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Premium Plan"
                      value={newPlan.name}
                      onChange={(e) => updateForm("name", e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      step="0.01"
                      placeholder="Enter plan price"
                      value={newPlan.price}
                      onChange={(e) => updateForm("price", e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Plan Type</label>
                    <select
                      className="form-select"
                      value={newPlan.duration}
                      onChange={(e) => handleDurationChange(e.target.value)}
                    >
                      <option value="trial">Free Trial</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Duration (Days)
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      value={newPlan.duration_days}
                      onChange={(e) =>
                        updateForm("duration_days", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label fw-semibold">
                        Maximum Staff
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        value={newPlan.max_staff}
                        onChange={(e) =>
                          updateForm("max_staff", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="col-6 mb-3">
                      <label className="form-label fw-semibold">
                        Maximum Tables
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        value={newPlan.max_tables}
                        onChange={(e) =>
                          updateForm("max_tables", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>


                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Features
                    </label>

                    <div className="input-group mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter feature name"
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddFeature();
                          }
                        }}
                      />

                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={handleAddFeature}
                      >
                        <FaPlus className="me-1" />
                        Add
                      </button>
                    </div>

                    {customFeatures.map((feature) => (
                      <div
                        key={feature}
                        className="d-flex justify-content-between align-items-center border rounded p-2 mb-2"
                      >
                        <span>{feature}</span>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveFeature(feature)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                </div>

                <div className="modal-footer border-0 px-4 pb-4">
                  <button
                    type="button"
                    className="btn btn-light px-4"
                    disabled={saving}
                    onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={saving}>
                    {saving ? "Saving..." : "Save Plan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Plan Modal */}
      {showConfirmModal && selectedPlan && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }} >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Confirm Your Plan</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowConfirmModal(false)}
                />
              </div>

              <div className="modal-body text-center p-4">
                <FaCheckCircle
                  size={45}
                  className="text-success mb-3"
                />

                <h4 className="fw-bold">{selectedPlan.plan_name}</h4>

                <h2 className="fw-bold text-primary">
                  ₹{Number(selectedPlan.price).toLocaleString("en-IN")}
                </h2>

                <p className="text-muted">
                  Validity: {getDurationText(selectedPlan)}
                </p>

                <p>
                  {selectedPlan.plan_type === "trial"
                    ? "Start your free trial. No payment is required."
                    : "Confirm your plan to continue to payment."}
                </p>

                <button
                  type="button"
                  className="btn btn-dark w-100 py-2 fw-semibold"
                  onClick={handleConfirmPlan}>
                  {selectedPlan.plan_type === "trial"
                    ? "Start Free Trial"
                    : "Proceed to Payment"}
                </button>

                <button
                  type="button"
                  className="btn btn-light w-100 mt-2"
                  onClick={() => setShowConfirmModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubscriptionPlan;