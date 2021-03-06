import axios from 'axios'

const BACKEND='https://www.thebeerfeed.com';

export default store => next => action => {
  if(action.meta && action.meta.api){
    next({
      type : `${action.type}_PENDING`,
      payload : {
        loader : true
      },
      meta : {
        issueLoader : true
      }
    })
    const {method, body, url, json} = action.payload

    return axios.request({
      url : `${BACKEND}${url}`,
      method : method,
      data : body
    })
      .then(response => {
        next({
          type : `${action.type}_SUCCESS`,
          payload : response.data,
          meta : {hideLoader : true}
        })
      })
      .catch(err => {
        console.log(err)
        next({
          type : `${action.type}_ERROR`,
          payload : err.response.data,
          meta : {error : true, hideLoader : true}
        })
      })
  }else{
    next(action)
  }
}