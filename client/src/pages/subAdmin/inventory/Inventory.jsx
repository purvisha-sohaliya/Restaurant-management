import React, { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaUtensils, FaBoxes, } from "react-icons/fa";
import { createInventory, deleteInventory, getInventory, getLowStock, updateInventory, addStock } from "../../../services/inventoryservice";
import { createRecipe, deleteRecipe, getRecipes, updateRecipe } from "../../../services/recipeService";
import { toast } from "react-toastify";
import { getMenuItems } from "../../../services/menuItemService";

const Inventory = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inventoryStats, setInventoryStats] = useState({
        lowStock: 0, outOfStock: 0,
    });
    const [menuItems, setMenuItems] = useState([]);
    const [menuLoading, setMenuLoading] = useState(false);

    useEffect(() => {
        loadInventory();
        loadRecipes();
        loadMenuItems();
    }, []);

    const loadInventory = async () => {
        try {
            setLoading(true);
            const inventoryRes = await getInventory();
            const inventoryData = inventoryRes.data || [];
            setItems(inventoryData);
            try {
                const lowStockRes = await getLowStock();
                setInventoryStats({
                    lowStock: Number(lowStockRes.count) || 0,
                    outOfStock: Number(inventoryRes.outOfStockCount) || 0
                });

            } catch (error) {
                console.error("Low stock API error:", error);

                setInventoryStats({
                    lowStock: 0,
                    outOfStock: Number(inventoryRes.outOfStockCount) || 0
                });
            }
        } catch (error) {
            console.error("Inventory load error:", error);
            toast.error(error.response?.data?.message || "Failed to load inventory");
        } finally {
            setLoading(false);
        }
    };
    // ======= c
    const loadRecipes = async () => {
        try {
            setRecipeLoading(true);
            const res = await getRecipes();
            setRecipes(res.data || []);
        } catch (error) {
            console.error("Recipe load error:", error);
            toast.error(
                error.response?.data?.message ||
                "Failed to load recipes"
            );
        } finally {
            setRecipeLoading(false);
        }
    };
    // ======= c
    const loadMenuItems = async () => {
        try {
            setMenuLoading(true);
            const res = await getMenuItems();
            setMenuItems(res.data || []);
        } catch (error) {
            console.error("Menu items load error:", error);
            toast.error(
                error.response?.data?.message ||
                "Failed to load menu items"
            );
        } finally {
            setMenuLoading(false);
        }
    };
    // ================= RECIPE DATA =================
    const [recipes, setRecipes] = useState([]);
    const [recipeLoading, setRecipeLoading] = useState(false);

    // ================= TABS =================
    const [activeTab, setActiveTab] = useState("inventory");

    // ================= INVENTORY FORM =================
    const initialItemForm = {
        item_name: "",
        unit: "kg",
        current_stock: "",
        minimum_stock: "",
        purchase_price: "",
        expiry_date: "",
    };

    const [itemForm, setItemForm] = useState(initialItemForm);
    const [showItemForm, setShowItemForm] = useState(false);
    const [editItemId, setEditItemId] = useState(null);
    const [itemSearch, setItemSearch] = useState("");

    const [showStockForm, setShowStockForm] = useState(false);
    const [stockItem, setStockItem] = useState(null);
    const [stockQuantity, setStockQuantity] = useState("");
    const [stockLoading, setStockLoading] = useState(false);

    // ================= RECIPE FORM c=================
    const initialRecipeForm = {
        menu_item_id: "",
        ingredients: [
            {
                inventory_id: "",
                quantity: "",
            },
        ],
    };
    const [recipeForm, setRecipeForm] = useState(initialRecipeForm);
    const [showRecipeForm, setShowRecipeForm] = useState(false);
    const [editRecipeId, setEditRecipeId] = useState(null);
    const [recipeSearch, setRecipeSearch] = useState("");

    // ================= ITEM INPUT =================
    const handleItemChange = (e) => {
        const { name, value } = e.target;
        setItemForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ================= ADD ITEM =================
    const handleAddItem = () => {
        setItemForm(initialItemForm);
        setEditItemId(null);
        setShowItemForm(true);
    };

    // ================= ADD STOCK =================
    const handleAddStock = (item) => {
        setStockItem(item);
        setStockQuantity("");
        setShowStockForm(true);
    };

    // ================= SAVE STOCK =================
    const handleStockSubmit = async (e) => {
        e.preventDefault();
        const quantity = Number(stockQuantity);
        if (!quantity || quantity <= 0) {
            toast.error("Please enter a valid quantity");
            return;
        }
        try {
            setStockLoading(true);
            const res = await addStock(
                stockItem._id,
                quantity
            );

            toast.success(
                res.message || "Stock added successfully"
            );

            setShowStockForm(false);
            setStockItem(null);
            setStockQuantity("");

            await loadInventory();

        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to add stock"
            );
        } finally {
            setStockLoading(false);
        }
    };
    // ================= EDIT ITEM c=================
    const handleEditItem = (item) => {
        console.log("EDIT ITEM:", item);
        setItemForm({
            item_name: item.item_name || "",
            unit: item.unit || "kg",
            current_stock: item.current_stock ?? "",
            minimum_stock: item.minimum_stock ?? "",
            purchase_price: item.purchase_price ?? "",
            expiry_date: item.expiry_date
                ? new Date(item.expiry_date).toISOString().split("T")[0]
                : "",
        });

        setEditItemId(item._id);
        setShowItemForm(true);
    };

    // ================= SAVE ITEM c=================
    const handleItemSubmit = async (e) => {
        e.preventDefault();

        if (!itemForm.item_name.trim()) {
            toast.error("Please enter item name");
            return;
        }

        if (!itemForm.unit) {
            toast.error("Please select unit");
            return;
        }

        try {
            const itemData = {
                item_name: itemForm.item_name.trim(),
                unit: itemForm.unit,
                current_stock: Number(itemForm.current_stock) || 0,
                minimum_stock: Number(itemForm.minimum_stock) || 0,
                purchase_price: Number(itemForm.purchase_price) || 0,
                expiry_date: itemForm.expiry_date || null,
            };

            if (editItemId) {
                const res = await updateInventory(
                    editItemId,
                    itemData
                );

                setItems((prev) =>
                    prev.map((item) =>
                        item._id === editItemId
                            ? res.data
                            : item
                    )
                );

                toast.success(
                    res.message || "Inventory updated successfully"
                );
            } else {
                const res = await createInventory(itemData);

                setItems((prev) => [
                    res.data,
                    ...prev,
                ]);

                toast.success(
                    res.message || "Inventory item created successfully"
                );
            }

            setItemForm(initialItemForm);
            setEditItemId(null);
            setShowItemForm(false);
        } catch (error) {
            console.error("Inventory save error:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to save inventory"
            );
        }
    };

    // ================= DELETE ITEM c =================
    const handleDeleteItem = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this item?");

        if (!confirmDelete) return;

        try {
            const res = await deleteInventory(id);
            setItems((prev) =>
                prev.filter((item) => item._id !== id)
            );

            toast.success(
                res.message || "Inventory item deleted successfully"
            );
        } catch (error) {
            console.error("Delete inventory error:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to delete inventory item"
            );
        }
    };

    // ================= RECIPE INPUT c =================
    const handleRecipeChange = (e) => {
        const { name, value } = e.target;

        setRecipeForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ================= INGREDIENT CHANGE c=================
    const handleIngredientChange = (index, field, value) => {
        setRecipeForm((prev) => {
            const ingredients = [...prev.ingredients];

            ingredients[index] = {
                ...ingredients[index],
                [field]: value,
            };

            return {
                ...prev,
                ingredients,
            };
        });
    };

    // ================= ADD INGREDIENT c=================
    const addIngredient = () => {
        setRecipeForm((prev) => ({
            ...prev,
            ingredients: [
                ...prev.ingredients,
                {
                    inventory_id: "",
                    quantity: "",
                },
            ],
        }));
    };

    // ================= REMOVE INGREDIENT c=================
    const removeIngredient = (index) => {
        setRecipeForm((prev) => ({
            ...prev,
            ingredients: prev.ingredients.filter(
                (_, i) => i !== index
            ),
        }));
    };

    // ================= ADD RECIPE c=================
    const handleAddRecipe = () => {
        setRecipeForm(initialRecipeForm);
        setEditRecipeId(null);
        setShowRecipeForm(true);
    };
    // ================= EDIT RECIPE c=================
    const handleEditRecipe = (recipe) => {
        setRecipeForm({
            menu_item_id:
                recipe.menu_item_id?._id ||
                recipe.menu_item_id ||
                "",

            ingredients: recipe.ingredients.map((ingredient) => ({
                inventory_id:
                    ingredient.inventory_id?._id ||
                    ingredient.inventory_id ||
                    "",

                quantity: ingredient.quantity ?? "",
            })),
        });

        setEditRecipeId(recipe._id);
        setShowRecipeForm(true);
    };

    // ================= SAVE RECIPE c=================
    const handleRecipeSubmit = async (e) => {
        e.preventDefault();

        if (!recipeForm.menu_item_id) {
            toast.error("Please select menu item");
            return;
        }

        const validIngredients = recipeForm.ingredients.filter(
            (ingredient) =>
                ingredient.inventory_id &&
                Number(ingredient.quantity) > 0
        );

        if (validIngredients.length === 0) {
            toast.error("Please add at least one ingredient");
            return;
        }

        try {
            const recipeData = {
                menu_item_id: recipeForm.menu_item_id,

                ingredients: validIngredients.map((ingredient) => ({
                    inventory_id: ingredient.inventory_id,
                    quantity: Number(ingredient.quantity),
                })),
            };

            if (editRecipeId) {
                await updateRecipe(
                    editRecipeId,
                    recipeData
                );

                toast.success(
                    "Recipe updated successfully"
                );
            } else {
                await createRecipe(recipeData);

                toast.success(
                    "Recipe created successfully"
                );
            }

            setRecipeForm(initialRecipeForm);
            setEditRecipeId(null);
            setShowRecipeForm(false);

            await loadRecipes();

        } catch (error) {
            console.error("Recipe save error:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to save recipe"
            );
        }
    };

    // ================= DELETE RECIPE c=================
    const handleDeleteRecipe = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this recipe?"
        );

        if (!confirmDelete) return;

        try {
            const res = await deleteRecipe(id);

            toast.success(
                res.message ||
                "Recipe deleted successfully"
            );

            await loadRecipes();

        } catch (error) {
            console.error(
                "Delete recipe error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to delete recipe"
            );
        }
    };

    // ================= STOCK STATUS =================
    const getStockStatus = (item) => {
        if (item.current_stock === 0) {
            return (
                <span className="stock-badge out">
                    Out of Stock
                </span>
            );
        }

        if (item.current_stock <= item.minimum_stock) {
            return (
                <span className="stock-badge low">
                    Low Stock
                </span>
            );
        }

        return (
            <span className="stock-badge available">
                In Stock
            </span>
        );
    };

    // ================= SEARCH ITEMS =================
    const filteredItems = items.filter((item) =>
        item.item_name
            .toLowerCase()
            .includes(itemSearch.toLowerCase())
    );

    // ================= SEARCH RECIPES c=================
    const filteredRecipes = recipes.filter((recipe) => {
        const menuName =
            recipe.menu_item_id?.item_name || "";

        const ingredientNames =
            recipe.ingredients
                .map(
                    (ingredient) =>
                        ingredient.inventory_id?.item_name || ""
                )
                .join(" ");

        return `${menuName} ${ingredientNames}`
            .toLowerCase()
            .includes(recipeSearch.toLowerCase());
    });

    // ================= SUMMARY =================
    const totalItems = items.length;
    const lowStock = inventoryStats.lowStock;
    const outOfStock = inventoryStats.outOfStock;

    const inventoryValue = items.reduce(
        (total, item) =>
            total +
            item.current_stock * item.purchase_price,
        0
    );

    return (
        <div className="inventory-page py-4 px-4 bg-light min-vh-100">

            {/* ================= HEADER ================= */}
            <div className="inventory-header d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

                <div>
                    <h2 className="m-0 fs-3 text-dark">
                        Inventory
                    </h2>

                    <p className="mt-1 mb-0 text-secondary">
                        Manage restaurant inventory and recipes
                    </p>
                </div>

                <button
                    className="add-btn bg-blue d-flex align-items-center gap-2 fw-semibold rounded-3 px-3 py-2 text-white border-0"
                    onClick={
                        activeTab === "inventory"
                            ? handleAddItem
                            : handleAddRecipe
                    }>
                    <FaPlus />

                    {activeTab === "inventory"
                        ? "Add Item"
                        : "Add Recipe"}
                </button>

            </div>

            {/* ================= SUMMARY ================= */}
            <div className="inventory-summary">

                <div className="summary-card">
                    <span>Total Items</span>
                    <h3>{totalItems}</h3>
                </div>

                <div className="summary-card">
                    <span>Low Stock</span>
                    <h3>{lowStock}</h3>
                </div>

                <div className="summary-card">
                    <span>Out of Stock</span>
                    <h3>{outOfStock}</h3>
                </div>

                <div className="summary-card">
                    <span>Inventory Value</span>
                    <h3>
                        ₹{inventoryValue.toLocaleString()}
                    </h3>
                </div>
            </div>

            {/* ================= TABS ================= */}
            <div className="bg-white border rounded-top-3 px-3 pt-3">
                <div className="d-flex gap-2 border-bottom">
                    <button
                        className={`btn border-0 rounded-0 px-4 py-2 fw-semibold shadow-none ${activeTab === "inventory"
                            ? "text-dark border-bottom border-dark border-3"
                            : "text-secondary"
                            }`}
                        onClick={() => setActiveTab("inventory")}>
                        <FaBoxes className="me-2" />
                        Inventory Items
                    </button>

                    <button
                        className={`btn border-0 rounded-0 px-4 py-2 fw-semibold shadow-none ${activeTab === "recipes"
                            ? "text-dark border-bottom border-dark border-3"
                            : "text-secondary"
                            }`}
                        onClick={() => setActiveTab("recipes")}
                    >
                        <FaUtensils className="me-2" />
                        Recipes
                    </button>
                </div>
            </div>

            {/* INVENTORY TAB */}
            {activeTab === "inventory" && (
                <>
                    {/* SEARCH */}
                    <div className="inventory-toolbar bg-white p-3 ">
                        <div className="search-box d-flex align-items-center gap-2 border rounded-3 px-3 w-100">
                            <FaSearch className="text-secondary" />
                            <input
                                className="form-control border-0 shadow-none py-2"
                                type="text"
                                placeholder="Search item or category..."
                                value={itemSearch}
                                onChange={(e) =>
                                    setItemSearch(e.target.value)
                                }
                            />
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="inventory-table-wrapper bg-white overflow-auto border border-top-0">
                        <table className="inventory-table w-100 mb-0">
                            <thead>
                                <tr>
                                    <th className="bg-light text-secondary">
                                        Item Name
                                    </th>

                                    <th className="bg-light text-secondary">
                                        Unit
                                    </th>

                                    <th className="bg-light text-secondary">
                                        Current Stock
                                    </th>

                                    <th className="bg-light text-secondary">
                                        Min Stock
                                    </th>

                                    <th className="bg-light text-secondary">
                                        Purchase Price
                                    </th>

                                    {/* <th className="bg-light text-secondary">
                                        Created Date
                                    </th> */}

                                    <th className="bg-light text-secondary">
                                        Expiry Date
                                    </th>

                                    <th className="bg-light text-secondary">
                                        Status
                                    </th>

                                    <th className="bg-light text-secondary">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredItems.length > 0 ? (
                                    filteredItems.map((item) => (

                                        <tr key={item._id}>
                                            <td className="fw-bold">
                                                {item.item_name}
                                            </td>

                                            <td>
                                                {item.unit}
                                            </td>

                                            <td>
                                                <strong>
                                                    {item.current_stock}
                                                </strong>
                                            </td>

                                            <td>
                                                {item.minimum_stock}
                                            </td>

                                            <td>
                                                ₹{item.purchase_price}
                                            </td>
                                            {/* <td>
                                                {item.createdAt
                                                    ? new Date(item.createdAt).toLocaleDateString()
                                                    : "-"}
                                            </td> */}

                                            <td>
                                                {item.expiry_date
                                                    ? new Date(item.expiry_date).toLocaleDateString("en-GB")
                                                    : "-"}
                                            </td>

                                            <td>
                                                {getStockStatus(item)}
                                            </td>

                                            <td>
                                                <div className="action-buttons d-flex gap-2">

                                                    {/* EDIT */}
                                                    <button
                                                        type="button"
                                                        className="edit-btn border-0 rounded-2 d-flex align-items-center justify-content-center"
                                                        onClick={() => handleEditItem(item)}
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>

                                                    {/* ADD STOCK */}
                                                    <button
                                                        type="button"
                                                        className="add-stock-btn border-0 rounded-2 d-flex align-items-center justify-content-center"
                                                        onClick={() => handleAddStock(item)}
                                                        title="Add Stock"
                                                    >
                                                        <FaPlus />
                                                    </button>

                                                    {/* DELETE */}
                                                    <button
                                                        type="button"
                                                        className="delete-btn border-0 rounded-2 d-flex align-items-center justify-content-center"
                                                        onClick={() => handleDeleteItem(item._id)}
                                                        title="Delete"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (

                                    <tr>
                                        <td
                                            colSpan="10"
                                            className="text-center py-4 text-secondary" >
                                            No inventory items found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* RECIPE TAB */}
            {activeTab === "recipes" && (
                <>
                    {/* RECIPE SEARCH */}
                    <div className="inventory-toolbar bg-white p-3 border border-top-0">
                        <div className="search-box d-flex align-items-center gap-2 border rounded-3 px-3 w-100">
                            <FaSearch className="text-secondary" />
                            <input
                                className="form-control border-0 shadow-none py-2"
                                type="text"
                                placeholder="Search recipe or ingredient..."
                                value={recipeSearch}
                                onChange={(e) =>
                                    setRecipeSearch(e.target.value)
                                } />
                        </div>
                    </div>
                    {/* RECIPE TABLE */}
                    <div className="bg-white border border-top-0 overflow-auto">
                        <table className="inventory-table w-100 mb-0">
                            <thead>
                                <tr>
                                    <th className="bg-light text-secondary">
                                        Menu Item
                                    </th>

                                    <th className="bg-light text-secondary">
                                        Ingredients
                                    </th>

                                    <th className="bg-light text-secondary">
                                        Total Ingredients
                                    </th>

                                    <th className="bg-light text-secondary">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {recipeLoading ? (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="text-center py-4 text-secondary">
                                            Loading recipes...
                                        </td>
                                    </tr>
                                ) : filteredRecipes.length > 0 ? (
                                    filteredRecipes.map((recipe) => (
                                        <tr key={recipe._id}>
                                            {/* MENU ITEM */}
                                            <td className="fw-bold">
                                                <div className="d-flex align-items-center gap-2">
                                                    {recipe.menu_item_id?.item_name || "-"}
                                                </div>
                                            </td>

                                            {/* INGREDIENTS */}
                                            <td>
                                                <div className="d-flex flex-wrap gap-2">
                                                    {recipe.ingredients?.map((ingredient, index) => (
                                                        <span
                                                            key={index}
                                                            className="badge bg-light text-dark border px-2 py-2"
                                                        >
                                                            {ingredient.inventory_id?.item_name || "-"}{" "}
                                                            {ingredient.quantity}{" "}
                                                            {ingredient.inventory_id?.unit || ""}
                                                        </span>
                                                    ))}

                                                </div>

                                            </td>

                                            {/* TOTAL INGREDIENTS */}
                                            <td>
                                                {recipe.ingredients?.length || 0}
                                            </td>

                                            {/* ACTION */}
                                            <td>
                                                <div className="action-buttons d-flex gap-2">
                                                    <button
                                                        className="edit-btn border-0 rounded-2 d-flex align-items-center justify-content-center"
                                                        onClick={() =>
                                                            handleEditRecipe(recipe)
                                                        }
                                                    >
                                                        <FaEdit />
                                                    </button>

                                                    <button
                                                        className="delete-btn border-0 rounded-2 d-flex align-items-center justify-content-center"
                                                        onClick={() =>
                                                            handleDeleteRecipe(recipe._id)
                                                        }>
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="text-center py-4 text-secondary">
                                            No recipes found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* INVENTORY ITEM MODAL */}
            {showItemForm && (

                <div className="inventory-modal-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3">
                    <div className="inventory-modal">
                        <div className="modal-header d-flex justify-content-between align-items-start mb-4">
                            <div>
                                <h3> {editItemId
                                    ? "Edit Inventory Item" : "Add Inventory Item"}
                                </h3>
                                <p>
                                    Enter inventory item details
                                </p>
                            </div>
                            <button
                                className="close-btn border-0 bg-transparent text-secondary p-0 fs-4"
                                onClick={() => {
                                    setShowItemForm(false);
                                    setEditItemId(null);
                                }} >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleItemSubmit}>
                            <div className="row g-3">
                                <div className="col-12 col-md-6">
                                    <label className="fw-semibold text-dark mb-2">
                                        Item Name *
                                    </label>
                                    <input type="text" name="item_name" value={itemForm.item_name} onChange={handleItemChange}
                                        placeholder="Enter item name" className="form-control rounded-2 shadow-none" required />
                                </div>

                                <div className="col-12 col-md-6">
                                    <label className="fw-semibold text-dark mb-2">
                                        Unit
                                    </label>

                                    <select name="unit" value={itemForm.unit} onChange={handleItemChange}
                                        className="form-select rounded-2 shadow-none" required>
                                        <option value="kg">Kg</option>
                                        <option value="gram">Gram</option>
                                        <option value="liter">Liter</option>
                                        <option value="ml">ML</option>
                                        <option value="piece">Piece</option>
                                    </select>
                                </div>

                                <div className="col-12 col-md-6">
                                    <label className="fw-semibold text-dark mb-2">
                                        Current Stock
                                    </label>

                                    <input type="number" name="current_stock"
                                        value={itemForm.current_stock} onChange={handleItemChange} min="0"
                                        placeholder="Enter current stock" className="form-control rounded-2 shadow-none" required />
                                </div>

                                <div className="col-12 col-md-6">
                                    <label className="fw-semibold text-dark mb-2">
                                        Minimum Stock
                                    </label>

                                    <input type="number" name="minimum_stock" value={itemForm.minimum_stock}
                                        onChange={handleItemChange} min="0" placeholder="Enter minimum stock"
                                        className="form-control rounded-2 shadow-none" required />
                                </div>

                                <div className="col-12 col-md-6">
                                    <label className="fw-semibold text-dark mb-2">
                                        Purchase Price
                                    </label>

                                    <input type="number" name="purchase_price" value={itemForm.purchase_price}
                                        onChange={handleItemChange} min="0"
                                        placeholder="Enter purchase price" className="form-control rounded-2 shadow-none" required />
                                </div>

                                <div className="col-12 col-md-6">
                                    <label className="fw-semibold text-dark mb-2">
                                        Expiry Date
                                    </label>

                                    <input type="date" name="expiry_date" value={itemForm.expiry_date}
                                        onChange={handleItemChange} className="form-control rounded-2 shadow-none" required />
                                </div>
                            </div>

                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <button type="button"
                                    className="btn btn-light border-0 px-3 py-2 rounded-2 fw-semibold"
                                    onClick={() => { setShowItemForm(false); setEditItemId(null); }} >
                                    Cancel
                                </button>

                                <button type="submit"
                                    className="btn bg-blue border-0 px-3 py-2 rounded-2 fw-semibold text-white">
                                    {editItemId ? "Update Item" : "Save Item"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* ================= ADD STOCK MODAL ================= */}
            {showStockForm && stockItem && (
                <div className="inventory-modal-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3">

                    <div className="inventory-modal">

                        {/* HEADER */}
                        <div className="modal-header d-flex justify-content-between align-items-start mb-4">

                            <div>
                                <h3 className="m-0">
                                    Add Stock
                                </h3>

                                <p className="mt-2 mb-0 text-secondary">
                                    Add stock to inventory item
                                </p>
                            </div>

                            <button
                                type="button"
                                className="close-btn border-0 bg-transparent text-secondary p-0 fs-4"
                                onClick={() => {
                                    setShowStockForm(false);
                                    setStockItem(null);
                                    setStockQuantity("");
                                }}
                            >
                                <FaTimes />
                            </button>

                        </div>

                        <form onSubmit={handleStockSubmit}>

                            {/* ITEM NAME */}
                            <div className="mb-3">

                                <label className="fw-semibold text-dark mb-2">
                                    Item Name
                                </label>

                                <input
                                    type="text"
                                    value={stockItem.item_name}
                                    disabled
                                    className="form-control rounded-2"
                                />

                            </div>

                            {/* CURRENT STOCK */}
                            <div className="mb-3">

                                <label className="fw-semibold text-dark mb-2">
                                    Current Stock
                                </label>

                                <div className="input-group">

                                    <input
                                        type="text"
                                        value={stockItem.current_stock}
                                        disabled
                                        className="form-control rounded-start-2"
                                    />

                                    <span className="input-group-text bg-white">
                                        {stockItem.unit}
                                    </span>

                                </div>

                            </div>

                            {/* ADD QUANTITY */}
                            <div className="mb-3">

                                <label className="fw-semibold text-dark mb-2">
                                    Add Quantity *
                                </label>

                                <div className="input-group">

                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={stockQuantity}
                                        onChange={(e) =>
                                            setStockQuantity(e.target.value)
                                        }
                                        placeholder="Enter quantity"
                                        className="form-control rounded-start-2 shadow-none"
                                        autoFocus
                                    />

                                    <span className="input-group-text bg-white">
                                        {stockItem.unit}
                                    </span>

                                </div>

                            </div>

                            {/* PREVIEW */}
                            {Number(stockQuantity) > 0 && (
                                <div className="alert alert-light border mb-4">

                                    <strong>
                                        New Stock:
                                    </strong>{" "}

                                    {Number(stockItem.current_stock) +
                                        Number(stockQuantity)}{" "}
                                    {stockItem.unit}

                                </div>
                            )}

                            {/* FOOTER */}
                            <div className="d-flex justify-content-end gap-2 mt-4">

                                <button
                                    type="button"
                                    className="btn btn-light border-0 px-3 py-2 rounded-2 fw-semibold"
                                    onClick={() => {
                                        setShowStockForm(false);
                                        setStockItem(null);
                                        setStockQuantity("");
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn bg-blue border-0 px-3 py-2 rounded-2 fw-semibold text-white"
                                    disabled={stockLoading}>
                                    {stockLoading
                                        ? "Adding..."
                                        : "Add Stock"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/*  RECIPE MODAL c*/}
            {showRecipeForm && (
                <div className="inventory-modal-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3">

                    <div className="inventory-modal">

                        {/* HEADER */}
                        <div className="modal-header d-flex justify-content-between align-items-start mb-4">

                            <div>
                                <h3>
                                    {editRecipeId
                                        ? "Edit Recipe"
                                        : "Add Recipe"}
                                </h3>

                                <p>
                                    Add menu item ingredients
                                </p>
                            </div>

                            <button
                                type="button"
                                className="close-btn border-0 bg-transparent text-secondary p-0 fs-4"
                                onClick={() => {
                                    setShowRecipeForm(false);
                                    setEditRecipeId(null);
                                    setRecipeForm(initialRecipeForm);
                                }}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleRecipeSubmit}>

                            {/* MENU ITEM */}
                            <div className="mb-4">

                                <label className="fw-semibold text-dark mb-2">
                                    Menu Item *
                                </label>

                                <select
                                    name="menu_item_id"
                                    value={recipeForm.menu_item_id}
                                    onChange={handleRecipeChange}
                                    className="form-select rounded-2 shadow-none"
                                    disabled={menuLoading}>

                                    <option value="">
                                        {menuLoading
                                            ? "Loading menu items..."
                                            : "Select Menu Item"}
                                    </option>

                                    {menuItems.map((menu) => (
                                        <option
                                            key={menu._id}
                                            value={menu._id}
                                        >
                                            {menu.item_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* INGREDIENT HEADER */}
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="m-0 fw-bold">
                                    Ingredients
                                </h6>
                                <button
                                    type="button"
                                    className="btn bg-blue text-white btn-sm d-flex align-items-center gap-2"
                                    onClick={addIngredient}>
                                    <FaPlus />
                                    Add Ingredient
                                </button>
                            </div>

                            {/* INGREDIENT ROWS */}
                            <div className="border rounded-3 p-3 bg-light">

                                {recipeForm.ingredients.map(
                                    (ingredient, index) => (
                                        <div
                                            key={index}
                                            className="row g-2 mb-3 align-items-end">
                                            {/* INVENTORY ITEM */}
                                            <div className="col-12 col-md-7">
                                                <label className="small fw-semibold mb-2">
                                                    Inventory Item
                                                </label>
                                                <select
                                                    value={ingredient.inventory_id}
                                                    onChange={(e) =>
                                                        handleIngredientChange(
                                                            index,
                                                            "inventory_id",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="form-select rounded-2 shadow-none">
                                                    <option value="">
                                                        Select item
                                                    </option>

                                                    {items.map((item) => (
                                                        <option
                                                            key={item._id}
                                                            value={item._id}>
                                                            {item.item_name}
                                                        </option>
                                                    ))}

                                                </select>

                                            </div>

                                            {/* QUANTITY */}
                                            <div className="col-10 col-md-4">

                                                <label className="small fw-semibold mb-2">
                                                    Quantity
                                                </label>

                                                <div className="input-group">

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="any"
                                                        value={ingredient.quantity}
                                                        onChange={(e) =>
                                                            handleIngredientChange(
                                                                index,
                                                                "quantity",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Qty"
                                                        className="form-control rounded-start-2 shadow-none"
                                                    />

                                                    <span className="input-group-text bg-white">
                                                        {items.find(
                                                            (item) =>
                                                                item._id === ingredient.inventory_id
                                                        )?.unit || "unit"}
                                                    </span>

                                                </div>

                                            </div>

                                            {/* DELETE */}
                                            <div className="col-2 col-md-1">

                                                {recipeForm.ingredients.length > 1 && (
                                                    <button
                                                        type="button"
                                                        className="delete-btn border-0 rounded-2 d-flex align-items-center justify-content-center"
                                                        onClick={() =>
                                                            removeIngredient(index)
                                                        }
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                )}

                                            </div>
                                        </div>
                                    )
                                )}
                            </div>

                            {/* FOOTER */}
                            <div className="d-flex justify-content-end gap-2 mt-4">

                                <button
                                    type="button"
                                    className="btn btn-light border-0 px-3 py-2 rounded-2 fw-semibold"
                                    onClick={() => {
                                        setShowRecipeForm(false);
                                        setEditRecipeId(null);
                                        setRecipeForm(initialRecipeForm);
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn bg-blue border-0 px-3 py-2 rounded-2 fw-semibold text-white"
                                >
                                    {editRecipeId
                                        ? "Update Recipe"
                                        : "Save Recipe"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;   