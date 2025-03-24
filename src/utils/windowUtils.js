export const createProjectDetailsWindow = (props) => {
  // First show a loading window
  const newWindow = window.open('', '_blank', 'width=800,height=700,scrollbars=yes,resizable=yes');
  
  // Write loading state
  newWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Loading...</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
      <div class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p class="text-gray-600">Loading project details...</p>
        </div>
      </div>
    </body>
    </html>
  `);

  // Extract data from props
  const { project, creatorName, headers, majorColorClass } = props;
  
  // Process project fields
  const projectFields = {};
  if (Object.keys(headers).length > 0) {
    console.log('Processing headers:', headers);
    console.log('Project data:', project);
    // CASE 1: When headers exist
    for (const [headerKey, headerConfig] of Object.entries(headers)) {
      // Skip Title and Description as they are handled separately
      if (headerKey === 'Title' || headerKey === 'Description') continue;
      
      // Check if the field exists in the project data
      if (headerKey in project) {
        console.log(`Field ${headerKey} exists in project with value:`, project[headerKey]);
        projectFields[headerKey] = project[headerKey];
      } else {
        console.log(`Field ${headerKey} not found in project data`);
        // If field doesn't exist in project, set it as empty
        projectFields[headerKey] = '';
      }
    }
  } else {
    // CASE 2: When no headers exist, show all fields except excluded ones
    const excludedFields = ['id', 'userId', 'isAssigned', 'createdAt', 'Title', 'major', 'Description', 'majorDocId'];
    for (const [key, value] of Object.entries(project)) {
      if (!excludedFields.includes(key)) {
        projectFields[key] = value;
      }
    }
  }
  
  console.log('Final processed project fields:', projectFields);
  
  // Helper function to format field names
  const formatFieldName = (key) => {
    if (headers[key]?.label) {
      return headers[key].label;
    }
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };
  
  // Helper function to format field values
  const formatFieldValue = (value) => {
    console.log('Formatting value:', value);
    if (value === null || value === undefined) return 'Not specified';
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    
    if (Array.isArray(value)) {
      return value.map(item => 
        `<span class="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-2">${item}</span>`
      ).join('');
    }
    
    if (typeof value === 'object') {
      if (value.toDate && typeof value.toDate === 'function') {
        try {
          return value.toDate().toLocaleDateString();
        } catch (e) {
          return 'Invalid date';
        }
      }
      return JSON.stringify(value).replace(/[[\]"]/g, '');
    }
    
    return value;
  };
  
  // Function to generate HTML content
  const generateHtml = (projectData, fields, headerData) => {
    // Generate fields HTML
    let fieldsHtml = '';
    for (const [key, value] of Object.entries(fields)) {
      fieldsHtml += `
        <div class="border border-gray-200 rounded-md p-4 bg-gray-50">
          <h3 class="text-sm font-medium text-gray-500 mb-1">${formatFieldName(key)}</h3>
          <div class="text-gray-900">${formatFieldValue(value)}</div>
        </div>
      `;
    }
    
    // Get color classes
    const bgClass = majorColorClass?.bg || 'bg-blue-100';
    const textClass = majorColorClass?.text || 'text-blue-800';
    
    // Create HTML content
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${projectData.Title} - Project Details</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      </head>
      <body class="bg-gray-50">
        <div class="min-h-screen p-8">
          <div class="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <!-- Project Header -->
            <div class="mb-8">
              <h1 class="text-3xl font-bold text-gray-900">${projectData.Title}</h1>
              <div class="mt-2 flex items-center">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-medium ${bgClass} ${textClass}">
                  ${projectData.major}
                </span>
                <span class="mx-2 text-gray-300">•</span>
                <span class="text-sm text-gray-500">Created by ${creatorName}</span>
              </div>
            </div>

            <!-- Project Description -->
            <div class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 mb-2">Description</h2>
              ${projectData.Description 
                ? `<div class="text-gray-700 whitespace-pre-line">${projectData.Description}</div>`
                : `<div class="text-gray-500 italic">No description provided</div>`
              }
            </div>

            <!-- Project Details Fields -->
            <div>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Project Details</h2>
              ${Object.keys(fields).length > 0 ? 
                `<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  ${fieldsHtml}
                </div>` : 
                `<div class="text-gray-500 italic">No additional details available</div>`
              }
            </div>

            <!-- Close Print Button -->
            <div class="mt-10 flex justify-end">
              <button
                onclick="window.close()"
                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Write initial HTML
  const writeContent = (projectData, fields, headerData) => {
    newWindow.document.open();
    newWindow.document.write(generateHtml(projectData, fields, headerData));
    newWindow.document.close();
  };

  // Write initial content
  writeContent(project, projectFields, headers);

  // Return window instance with updateData method
  return {
    window: newWindow,
    updateData: (newData) => {
      const updatedHeaders = newData.headers || headers;
      const updatedFields = {};
      
      if (Object.keys(updatedHeaders).length > 0) {
        for (const [key, value] of Object.entries(project)) {
          if (updatedHeaders[key] && key !== 'Title' && key !== 'Description') {
            updatedFields[key] = value;
          }
        }
      } else {
        const excludedFields = ['id', 'userId', 'isAssigned', 'createdAt', 'Title', 'major', 'Description', 'majorDocId'];
        for (const [key, value] of Object.entries(project)) {
          if (!excludedFields.includes(key)) {
            updatedFields[key] = value;
          }
        }
      }
      
      writeContent(project, updatedFields, updatedHeaders);
    }
  };
}; 