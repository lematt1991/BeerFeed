import axios from 'axios'

export default store => next => action => {
  if(action.meta === 'API'){
    next({
      type : `${action.type}_PENDING`,
      payload : {
        loader : true
      },
      meta : {
        issueLoader : true
      }
    })
    const {method, body, url} = action.payload

    return axios.request({
      url : url,
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