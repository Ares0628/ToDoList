const express = require("express");
const mongoose =require("mongoose");
const _ = require("lodash");
require("dotenv").config();

const app = express();
const port = process.env.PORT;
app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

//* Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL)
  .then( ()=>console.log('Connected to MongoDB successfully!'))
  .catch(()=>console.log('Failed to connect to MongoDB!'));

// Declare the schema, model
const itemsSchema = {
  name:String
};

const Item = mongoose.model("Item",itemsSchema);

const listSchema = {
  name:String,
  items:[itemsSchema]
};

const List = mongoose.model("List", listSchema)

const item1 = new Item({
  name:"Staring your To do list!!"
});

const item2 = new Item({
  name:"Click + to add item"
});

const item3 = new Item({
  name:"Click - to delete item"
});

const defaultItems =[item1,item2,item3];



app.get("/", function(req, res) {
  Item.find()
    .then((result)=>{
      if(result.length === 0){
        Item.insertMany(defaultItems)
          .then(()=> console.log("Successfully insert dafault items"))
          .then(() => res.redirect("/"))
          .catch((err)=> console.log(err));
      }else{
        res.render("list", {listTitle: "Today", newListItems: result});
      }
    })

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const titleName =req.body.titleName;

  const item =new Item({
    name:itemName
  });

  if(titleName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name:titleName})
    .then((result)=>{
        result.items.push(item);
        result.save();
        })
    .then(()=>res.redirect("/"+titleName))
    .catch(()=>console.log("Homeless"));
  };



});


app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const titleName =req.body.titleName;

  if(titleName==="Today"){
      Item.findByIdAndRemove(checkedItemId)
        .then(() => console.log("Item deleted successfully"))
        .catch((err) => console.log("Error deleting item: ", err));
      res.redirect("/");
  } else {
    List.findOneAndUpdate(
      {name : titleName},
      {$pull : {items: {_id: checkedItemId}}})
      .then(()=>console.log("Item deleted successfully"))
      res.redirect("/" + titleName);
    }
    


})


app.get("/:customListName", function(req,res){
  
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName})
    .then((result)=>{
      if( !result ){
        List.insertMany({
          name:customListName, 
          items:defaultItems})
          .then(()=> console.log("Successfully insert dafault items"))
          .then(()=>res.redirect("/"+customListName))
      } else {
        res.render("list", {listTitle:customListName, newListItems:result.items});
      }
    })
    .catch((err)=> console.log(err));

})
app.get("/about", function(req, res){
  res.render("about");
});

app.listen(port, function() {
  console.log(`Server is listening on port ${port}`);
});
