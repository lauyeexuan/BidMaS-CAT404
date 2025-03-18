// Create a new file for milestone helper functions
export const getDaysRemaining = (milestone) => {
  if (!milestone || !milestone.deadline) {
    console.log('Missing milestone or deadline:', milestone)
    return 0
  }
  
  try {
    // Log the incoming deadline format
    console.log('Deadline type:', typeof milestone.deadline, 'Value:', milestone.deadline)
    
    let deadlineDate

    const deadline = milestone.deadline
    
    // Check if it's a Firestore timestamp
    if (deadline.toDate && typeof deadline.toDate === 'function') {
      deadlineDate = deadline.toDate()
    }
    // Check if it's already a Date object
    else if (deadline instanceof Date) {
      deadlineDate = deadline
    }
    // Check if it's a timestamp number
    else if (typeof deadline === 'number') {
      deadlineDate = new Date(deadline)
    }
    // Check if it's a string that needs parsing
    else if (typeof deadline === 'string') {
      deadlineDate = new Date(Date.parse(deadline))
    }
    // If it's an object with seconds (Firestore timestamp format)
    else if (deadline.seconds) {
      deadlineDate = new Date(deadline.seconds * 1000)
    }
    else {
      console.error('Unhandled deadline format:', deadline)
      return 0
    }
    
    // Validate the parsed date
    if (!deadlineDate || isNaN(deadlineDate.getTime())) {
      console.error('Invalid date after conversion:', deadlineDate)
      return 0
    }
    
    const now = new Date()
    
    // If deadline has passed, return 0
    if (now > deadlineDate) return 0
    
    // Calculate days remaining
    const diffTime = Math.abs(deadlineDate - now)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  } catch (err) {
    console.error('Error calculating days remaining:', err, 'Milestone:', milestone)
    return 0
  }
}

export const getDaysRemainingText = (milestone) => {
  const days = getDaysRemaining(milestone)
  
  if (days === 0) {
    return 'Due today'
  } else if (days === 1) {
    return '1 day left'
  } else {
    return `${days} days left`
  }
}

export const getDaysRemainingClass = (milestone) => {
  const days = getDaysRemaining(milestone)
  
  if (days < 3) {
    return 'text-red-600'
  } else if (days < 7) {
    return 'text-orange-500'
  } else {
    return 'text-green-600'
  }
}

export const getDaysRemainingPercentage = (milestone) => {
  const daysRemaining = getDaysRemaining(milestone)
  
  // If less than 30 days remaining, show percentage based on days left
  // 30 days = 100%, 0 days = 0%
  if (daysRemaining <= 30) {
    return (daysRemaining / 30) * 100
  }
  
  return 100 // If more than 30 days, show full bar
}

export const formatDate = (date) => {
  if (!date) {
    console.log('No date provided')
    return ''
  }
  
  try {
    // Log the incoming date format
    console.log('Date type:', typeof date, 'Value:', date)
    
    let dateObj

    if (date instanceof Date) {
      dateObj = date
      console.log('Converted date hahahaa:', dateObj)
    }

    // Validate the parsed date
    if (!dateObj || isNaN(dateObj.getTime())) {
      console.error('Invalid date after conversion:', dateObj)
      return 'Invalid date'
    }
    
    return dateObj.toLocaleString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    })
  } catch (err) {
    console.error('Date formatting error:', err, 'Date value:', date)
    return 'Invalid date'
  }
} 