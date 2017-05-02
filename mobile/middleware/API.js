import axios from 'axios'

const BACKEND='http://beerfeed-ml9951.rhcloud.com'

const id = x => x

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

    transform = action.meta.transform || id;

    return axios.request({
      url : `${BACKEND}/${url}`,
      method : method,
      data : body
    })
      .then(response => {
        next({
          type : `${action.type}_SUCCESS`,
          payload : transform(response.data),
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