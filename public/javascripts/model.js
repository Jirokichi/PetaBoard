// ****************************************************
// Groupクラス
// ****************************************************
function Group(name, privacy, id){
    this.name = name;
    this.privacy = privacy;
    this.id = id;
}
Group.prototype.log = function(){
    console.log("(name, privacy, id)" + "("+ this.name +", " + this.privacy + ", " + this.id +")");
}
// ****************************************************