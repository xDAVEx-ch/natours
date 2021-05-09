class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        //Filter data
        const queryObj = { ...this.queryString };
        const excludeFields = ['page', 'limit', 'fields', 'sort'];

        excludeFields.forEach((element) => delete queryObj[element]);

        //Advanced filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); //b exact - g global

        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }

    sort() {
        //Sorting
        if (this.queryString.sort) {
            //We want sort('price ratingsAverage')
            const sortBy = this.queryString.sort.split(',').join(' ');

            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    limitFields() {
        //Limiting fields
        if (this.queryString.fields) {
            //we want select(name duration)
            const fields = this.queryString.fields.split(',').join(' ');

            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    }

    paginate() {
        //Pagination
        //page=2&limit=10, page1 => 1 - 10, page2 => 11 - 20, page2 => 21 - 30
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        /*if (this.queryString.page) {
            const numTours = await Tour.countDocuments();
            if (skip >= numTours) {
                throw new Error('This page does not exist');
            }
        }*/

        return this;
    }
}

module.exports = APIFeatures;