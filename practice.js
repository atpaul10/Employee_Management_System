// const subject  = {
//     maths : 80,
//     science :90,
//     total: function sum (){
//         const innerFunction = ()=>{
//             return this.maths + this.science
//         }
//         return innerFunction()
//     }
// }
// console.log(subject.total())


let p = new Promise((resolve,reject)=>{
    let sucess = true

    setTimeout(()=>{
        if(sucess){
            resolve("Operation successfullt")
        }else{
            reject("Failed")
        }
    },2000)
})

p.then(result=>{
    console.log(result)
})
.catch(error=>{
    console.log(error)
})