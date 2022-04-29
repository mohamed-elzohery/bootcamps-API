const longResults = (model, populate) => async (req, res, next)=> {
    const queryStr = JSON.stringify(req.query).replace(/\b(lt|lte|gte|gt|in)\b/g, match => `$${match}`);
    const query = JSON.parse(queryStr)
 
    //Specify certain keys to do different functions
     const reservedFields = ['select', 'sort', 'page', 'limit'];
 
     //Exclude fields from filtering query object 
     reservedFields.forEach(field=> delete query[field]);
 
     //Save find query to a variable
     let findQuery = model.find(query);
 
     //Apply populate for courses field
     if(populate){
        findQuery.populate(populate);
     }
     
 
     //Set function for select field
     if(req.query.select){
         const selectedFields = req.query.select.split(',').join(' ');
         findQuery.select(selectedFields)
     }
 
      //Set function for sort field
      if(req.query.sort){
         const sortingFilelds = req.query.sort.split(',').join(' ');
         findQuery.sort(sortingFilelds)
     }
 
     //Pagination
     const page = parseInt(req.query.page, 10) || 1;
     const limit = parseInt(req.query.limit, 10) || 2;
     const skip = (page-1) * limit;
 
     //Calculate total number of pages
     const allPages = Math.ceil( await model.countDocuments(query) / limit);
     let pagination = null;
     
     //Create pagination object with prev & next page
     if (allPages > 1){
        pagination={};
        if(page == 1 ){
            pagination.next = page + 1;
        }else if(page == allPages){
            pagination.prev = page - 1;
        }else{
            pagination.prev = page - 1,
            pagination.next = page + 1
        }
     }
    
     findQuery.skip(skip).limit(limit)
 
     //Execute Query
     const allResorces = await findQuery;

     //Store in response object
     res.allResults = { count: allResorces.length ,allResorces, pagination};
 
     next()
}

module.exports = longResults;