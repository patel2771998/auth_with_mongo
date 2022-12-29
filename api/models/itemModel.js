
  module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        name: String,
        ext: String,
        id_user: String,
        type : String,
        status: {
          type: String,
          enum : ['active', 'pending', 'suspended', 'cancelled'],
          default: 'active'
        },
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Item = mongoose.model("item", schema);
    return Item;
  };

