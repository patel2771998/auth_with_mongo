module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        user_name: String,
        email: String,
        password: String,
        name : String,
        phone_number : String,
        address : String,
        otp : String,
        id_social : String,
        social_type : String,
        id_item_profile : String,
        status: {
          type: String,
          enum : ['active', 'pending', 'suspended', 'cancelled'],
          default: 'pending'
        },
        role: {
          type: String,
          enum : ['moderator', 'user', 'content_creator','super_admin'],
          default: 'user'
        },
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const User = mongoose.model("user", schema);
    return User;
  };