import React from "react"

const Loading = () => {
  return (
    <>
      <div className="fixed bg-[#D9D9D9] bottom-0 left-0 right-0 top-0 opacity-50 z-[99999999991]"/>
      <div className="fixed bottom-0 left-0 right-0 top-0 flex items-center flex-col justify-center z-[99999999991]">
      <div className='w-full h-40 flex items-center justify-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500'></div>
         </div>
      </div>
    </>
  )
}

export default Loading
