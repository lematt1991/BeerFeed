var timeout;
export default store => next => action => {
  const { meta = {} } = action;
  if(meta.debounce){
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      next(action), meta.debounce
    }, meta.debounce)
  }else{
    next(action)
  }
}