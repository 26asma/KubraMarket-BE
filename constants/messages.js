const product = require("../models/product");

module.exports = {
  auth: {
    INVALID_EMAIL: "Invalid email address.",
    INVALID_CREDENTIALS: "Invalid email or password.",
    EMAIL_REQUIRED: "Email is required.",
    PASSWORD_REQUIRED: "Password is required.",
    PASSWORD_TOO_SHORT: "Password must be at least 8 characters long.",
    PASSWORD_WEAK: "Password must contain uppercase, lowercase, number, and special character.",
    NAME_TOO_SHORT: "Name must be at least 2 characters long.",
    UNAUTHORIZED: "Invalid credentials. Please try again.",
    EMAIL_EXISTS: "Email already in use.",
    REGISTER_SUCCESS: "Registration successful.",
    LOGIN_SUCCESS: "Login successful.",
    USER_NOT_FOUND: "User not found.",
    ACCOUNT_RESTORED: 'Account restored successfully',
    RESET_LINK_SENT: "Password reset link sent to your email.",
    PASSWORD_RESET_SUCCESS: "Password reset successfully.",
    INVALID_OR_EXPIRED_TOKEN: "Invalid or expired token.",
    NOT_MERCHANT: 'Access denied: You are not a registered merchant.',
  NOT_AUTHORIZED_MERCHANT: 'Access denied: You do not have permission to manage this shop.',
  PROFILE_UPDATED:'profile updated sucessfully!',
  USER_DELETED: 'user deleted sucessfully',
  },

  general: {
    SERVER_ERROR: "Something went wrong. Please try again later.",
    NOT_FOUND: "Resource not found.",
    ACCESS_DENIED: "You do not have permission to perform this action.",
    ACTION_SUCCESS: "Action completed successfully.",
    BAD_REQUEST: "Bad request.",
    FORBIDDEN: "Forbidden.",
    CONFLICT: "Conflict occurred.",
  },

  products: {
    PRODUCT_NOT_FOUND: "Product not found.",
    PRODUCT_CREATED: "Product created successfully.",
    PRODUCT_UPDATED: "Product updated successfully.",
    PRODUCT_DELETED: "Product deleted successfully.",
  },

  orders: {
    ORDER_NOT_FOUND: "Order not found.",
    ORDER_PLACED: "Order placed successfully.",
  },
  shop: {
    SHOP_CREATED: "shop created successfully.",
    SHOP_DELETED: 'Shop deleted successfully! user role is updated to customer',
    SHOP_UPDATED: 'shop updated successfully!',
    UNAUTHORIZED_SHOP: 'You are not authorized to access this shop.',
  },

  category: {
  NOT_FOUND: 'Category not found.',
  CATEGORY_CREATED: 'Category created successfully.',
  CATEGORY_UPDATED: 'Category updated successfully.',
  CATEGORY_DELETED: 'Category deleted successfully.'
},
products:{
 NOT_FOUND: 'product not found.',
PRODUCT_CREATED: 'product created successfully' ,
PRODUCT_UPDATED:'Product updated successfully',
PRODUCT_DELETED: 'Product deleted successfully',
CREATION_FAILED:'product creation failed',
UNAUTHORIZED_PRODUCT_ACCESS: 'You are not authorized to access this product.',
  updated: "Product updated successfully.",
  update_failed: "Failed to update product.",
  deleted: "Product deleted successfully.",
  delete_failed: "Failed to delete product.",
  fetched_all: "All products fetched successfully.",
  fetched_one: "Product details fetched successfully.",
  fetch_failed: "Failed to fetch product(s).",
  not_found: "Product not found.",

},

  rent: {
    RENT_NOT_FOUND: "Rent payment not found for this merchant/shop.",
    RENT_ALREADY_PAID: "This rent is already marked as paid.",
    RENT_PAID_SUCCESS: "Rent marked as paid successfully.",
  },

  merchantRequest: {
    REQUEST_NOT_FOUND: "Merchant request not found.",
    REQUEST_APPROVED: "Merchant request approved successfully.",
    REQUEST_REJECTED: "Merchant request rejected successfully.",
    REQUEST_CREATED: "Merchant request created successfully.",
  },

  user: {
    USER_NOT_FOUND: "User not found.",
    USER_UPDATED: "User updated successfully.",
    USER_DELETED: "User deleted successfully."

}
};