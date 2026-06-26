import React from 'react'

type Props = {
  children: React.ReactNode
}

const layout = ({ children }: Props) => {
  return (
    <div className='w-full h-screen'>
      {children}
    </div>
  )
}

export default layout
