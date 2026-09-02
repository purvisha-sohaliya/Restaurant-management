import React from 'react'

const ErrorPage = () => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100">
      <h1 className="text-danger" style={{ fontSize: '3rem' }}>
        Error 404
      </h1>
      <p className="text-muted">The page you are looking for does not exist.</p>
      <button className="btn btn-dark px-4 py-2" onClick={() => window.history.back()}>
        Go Back
      </button>
    </div>
  )
}

export default ErrorPage
