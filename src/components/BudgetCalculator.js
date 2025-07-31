import React, { useState } from 'react';

const BudgetCalculator = () => {
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [budgetCategories, setBudgetCategories] = useState({
    bills: '',
    food: '',
    save: ''
  });
  const [categoryColors, setCategoryColors] = useState({
    bills: '#FF6B6B',
    food: '#4ECDC4',
    save: '#45B7D1'
  });
  const [categoryOrder, setCategoryOrder] = useState([
    'bills', 'food', 'save'
  ]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [timeFrame, setTimeFrame] = useState('12'); // Default to 12 months
  const [templateCategory, setTemplateCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  const handleIncomeChange = (e) => {
    setMonthlyIncome(e.target.value);
  };

  const handleCategoryChange = (category, value) => {
    setBudgetCategories(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const addCategory = () => {
    const newCategoryName = prompt('Enter category name:');
    if (newCategoryName && newCategoryName.trim()) {
      const trimmedName = newCategoryName.trim().toLowerCase().replace(/\s+/g, '_');
      if (!budgetCategories.hasOwnProperty(trimmedName)) {
        setBudgetCategories(prev => ({
          ...prev,
          [trimmedName]: ''
        }));
        setCategoryColors(prev => ({
          ...prev,
          [trimmedName]: getRandomColor()
        }));
        setCategoryOrder(prev => [...prev, trimmedName]);
      } else {
        alert('Category already exists!');
      }
    }
  };

  const addCategoryFromTemplate = (categoryName) => {
    if (categoryName && categoryName.trim()) {
      const trimmedName = categoryName.trim().toLowerCase().replace(/\s+/g, '_');
      if (!budgetCategories.hasOwnProperty(trimmedName)) {
        setBudgetCategories(prev => ({
          ...prev,
          [trimmedName]: ''
        }));
        setCategoryColors(prev => ({
          ...prev,
          [trimmedName]: getRandomColor()
        }));
        setCategoryOrder(prev => [...prev, trimmedName]);
        return true;
      } else {
        alert('Category already exists!');
        return false;
      }
    }
    return false;
  };

  const startEditingCategory = (category) => {
    setEditingCategory(category);
    setEditingCategoryName(formatCategoryName(category));
  };

  const saveCategoryName = (oldCategory) => {
    if (editingCategoryName && editingCategoryName.trim()) {
      const newCategoryName = editingCategoryName.trim().toLowerCase().replace(/\s+/g, '_');
      
      // Check if the new name already exists (excluding the current category)
      if (newCategoryName !== oldCategory && budgetCategories.hasOwnProperty(newCategoryName)) {
        alert('Category name already exists!');
        return;
      }

      // Update category order
      const newOrder = categoryOrder.map(cat => cat === oldCategory ? newCategoryName : cat);
      setCategoryOrder(newOrder);

      // Update budget categories
      const newCategories = { ...budgetCategories };
      newCategories[newCategoryName] = newCategories[oldCategory];
      delete newCategories[oldCategory];
      setBudgetCategories(newCategories);

      // Update category colors
      const newColors = { ...categoryColors };
      newColors[newCategoryName] = newColors[oldCategory];
      delete newColors[oldCategory];
      setCategoryColors(newColors);

      setEditingCategory(null);
      setEditingCategoryName('');
    }
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditingCategoryName('');
  };

  const removeCategory = (categoryToRemove) => {
    if (Object.keys(budgetCategories).length > 1) {
      const newCategories = { ...budgetCategories };
      delete newCategories[categoryToRemove];
      setBudgetCategories(newCategories);
      
      const newColors = { ...categoryColors };
      delete newColors[categoryToRemove];
      setCategoryColors(newColors);
      
      setCategoryOrder(prev => prev.filter(cat => cat !== categoryToRemove));
    } else {
      alert('You must have at least one category!');
    }
  };

  const getRandomColor = () => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
      '#A8E6CF', '#FF8B94', '#FFC3A0', '#FFD3B6', '#FFAAA5', '#FF8B94',
      '#B8E6B8', '#FFB6C1', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleDragStart = (e, category) => {
    setDraggedItem(category);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetCategory) => {
    e.preventDefault();
    if (draggedItem && draggedItem !== targetCategory) {
      const newOrder = [...categoryOrder];
      const draggedIndex = newOrder.indexOf(draggedItem);
      const targetIndex = newOrder.indexOf(targetCategory);
      
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedItem);
      
      setCategoryOrder(newOrder);
    }
    setDraggedItem(null);
  };

  const handleColorChange = (category, color) => {
    setCategoryColors(prev => ({
      ...prev,
      [category]: color
    }));
  };

  const calculateTotal = () => {
    return Object.values(budgetCategories).reduce((total, value) => {
      return total + (parseFloat(value) || 0);
    }, 0);
  };

  const calculateRemaining = () => {
    const total = calculateTotal();
    const income = parseFloat(monthlyIncome) || 0;
    return income - total;
  };

  const calculateProjectedTotals = () => {
    const months = parseInt(timeFrame);
    const income = parseFloat(monthlyIncome) || 0;
    const totalAllocated = calculateTotal();
    const remaining = calculateRemaining();
    
    return {
      totalIncome: income * months,
      totalAllocated: totalAllocated * months,
      totalRemaining: remaining * months,
      totalSaved: (budgetCategories.save || 0) * months,
      totalBills: (budgetCategories.bills || 0) * months,
      totalFood: (budgetCategories.food || 0) * months
    };
  };

  const getTimeFrameLabel = () => {
    const months = parseInt(timeFrame);
    if (months === 1) return '1 Month';
    if (months === 3) return '3 Months (Quarterly)';
    if (months === 6) return '6 Months (Semi-Annually)';
    if (months === 12) return '12 Months (Yearly)';
    if (months === 24) return '24 Months (2 Years)';
    if (months === 60) return '60 Months (5 Years)';
    return `${months} Months`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatLargeCurrency = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return formatCurrency(amount);
  };

  const getCategoryPercentage = (categoryValue) => {
    if (!monthlyIncome || !categoryValue) return 0;
    return (parseFloat(categoryValue) / parseFloat(monthlyIncome)) * 100;
  };

  const getCategoryColor = (category) => {
    return categoryColors[category] || '#6C5CE7';
  };

  const renderProgressBar = (category, value) => {
    const percentage = getCategoryPercentage(value);
    const color = getCategoryColor(category);
    
    return (
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: color
            }}
          ></div>
        </div>
        <span className="progress-text">{percentage.toFixed(1)}%</span>
      </div>
    );
  };

  const renderPieChart = () => {
    const categories = Object.entries(budgetCategories);
    const total = calculateTotal();
    const remaining = calculateRemaining();
    const income = parseFloat(monthlyIncome) || 0;
    
    if (income === 0) return <div className="no-data">Enter your monthly income to see budget distribution</div>;

    let currentAngle = 0;
    const radius = 80;
    const centerX = 100;
    const centerY = 100;

    return (
      <div className="pie-chart-container">
        <h3>Budget Distribution</h3>
        <svg width="200" height="200" className="pie-chart">
          {/* Render allocated categories in order */}
          {categoryOrder.map(category => {
            const value = budgetCategories[category];
            if (!value || parseFloat(value) === 0) return null;
            
            const percentage = (parseFloat(value) / income) * 100;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            const x1 = centerX + radius * Math.cos(startAngle * Math.PI / 180);
            const y1 = centerY + radius * Math.sin(startAngle * Math.PI / 180);
            const x2 = centerX + radius * Math.cos(endAngle * Math.PI / 180);
            const y2 = centerY + radius * Math.sin(endAngle * Math.PI / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');
            
            currentAngle += angle;
            
            return (
              <path
                key={category}
                d={pathData}
                fill={getCategoryColor(category)}
                stroke="#fff"
                strokeWidth="2"
              />
            );
          })}
          
          {/* Render unallocated/remaining slice */}
          {remaining > 0 && (
            (() => {
              const percentage = (remaining / income) * 100;
              const angle = (percentage / 100) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              
              const x1 = centerX + radius * Math.cos(startAngle * Math.PI / 180);
              const y1 = centerY + radius * Math.sin(startAngle * Math.PI / 180);
              const x2 = centerX + radius * Math.cos(endAngle * Math.PI / 180);
              const y2 = centerY + radius * Math.sin(endAngle * Math.PI / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              return (
                <path
                  key="unallocated"
                  d={pathData}
                  fill="#6c757d"
                  stroke="#fff"
                  strokeWidth="2"
                />
              );
            })()
          )}
        </svg>
        <div className="chart-legend">
          {/* Show allocated categories in order */}
          {categoryOrder.map(category => {
            const value = budgetCategories[category];
            if (!value || parseFloat(value) === 0) return null;
            const percentage = (parseFloat(value) / income) * 100;
            return (
              <div key={category} className="legend-item">
                <div 
                  className="legend-color" 
                  style={{ backgroundColor: getCategoryColor(category) }}
                ></div>
                <span className="legend-text">
                  {formatCategoryName(category)}: {percentage.toFixed(1)}%
                </span>
              </div>
            );
          })}
          
          {/* Show unallocated/remaining */}
          {remaining > 0 && (
            <div className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: '#6c757d' }}
              ></div>
              <span className="legend-text">
                Unallocated: {((remaining / income) * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProjectedTotals = () => {
    const projected = calculateProjectedTotals();
    const months = parseInt(timeFrame);
    
    if (!monthlyIncome) return null;

    return (
      <div className="projected-totals">
        <h3>Projected Totals - {getTimeFrameLabel()}</h3>
        <div className="time-frame-selector">
          <label htmlFor="timeFrame">Time Frame:</label>
          <select 
            id="timeFrame" 
            value={timeFrame} 
            onChange={(e) => setTimeFrame(e.target.value)}
            className="time-frame-select"
          >
            <option value="1">1 Month</option>
            <option value="3">3 Months (Quarterly)</option>
            <option value="6">6 Months (Semi-Annually)</option>
            <option value="12">12 Months (Yearly)</option>
            <option value="24">24 Months (2 Years)</option>
            <option value="60">60 Months (5 Years)</option>
          </select>
        </div>
        
        {/* Bar Chart Section */}
        <div className="chart-section">
          <h4>Projection Chart</h4>
          <div className="chart-container">
            {renderProjectionChart()}
          </div>
        </div>
        
        <div className="projected-grid">
          <div className="projected-item">
            <span className="projected-label">Total Income:</span>
            <span className="projected-value income">{formatLargeCurrency(projected.totalIncome)}</span>
          </div>
          <div className="projected-item">
            <span className="projected-label">Total Allocated:</span>
            <span className="projected-value allocated">{formatLargeCurrency(projected.totalAllocated)}</span>
          </div>
          <div className="projected-item">
            <span className="projected-label">Total Remaining:</span>
            <span className="projected-value remaining">{formatLargeCurrency(projected.totalRemaining)}</span>
          </div>
          {budgetCategories.save && (
            <div className="projected-item highlight">
              <span className="projected-label">Total Saved:</span>
              <span className="projected-value saved">{formatLargeCurrency(projected.totalSaved)}</span>
            </div>
          )}
          {budgetCategories.bills && (
            <div className="projected-item">
              <span className="projected-label">Total Bills:</span>
              <span className="projected-value bills">{formatLargeCurrency(projected.totalBills)}</span>
            </div>
          )}
          {budgetCategories.food && (
            <div className="projected-item">
              <span className="projected-label">Total Food:</span>
            <span className="projected-value food">{formatLargeCurrency(projected.totalFood)}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProjectionChart = () => {
    const months = parseInt(timeFrame);
    const income = parseFloat(monthlyIncome) || 0;
    
    if (!income) return <div className="no-data">Enter income to see projection chart</div>;

    // Make chart responsive - use container width or default to 600
    const containerWidth = window.innerWidth;
    const chartWidth = Math.max(600, Math.min(containerWidth - 100, 1200)); // Min 600, max 1200
    const chartHeight = 400;
    const padding = 80;
    const chartAreaWidth = chartWidth - padding * 2;
    const chartAreaHeight = chartHeight - padding * 2;
    
    // Get categories with values
    const categoriesWithValues = categoryOrder.filter(category => 
      budgetCategories[category] && parseFloat(budgetCategories[category]) > 0
    );
    
    if (categoriesWithValues.length === 0) {
      return <div className="no-data">Add budget values to see category comparison</div>;
    }

    const barHeight = chartAreaHeight / categoriesWithValues.length;
    const maxValue = Math.max(...categoriesWithValues.map(category => 
      parseFloat(budgetCategories[category]) * months
    ));
    const scale = chartAreaWidth / maxValue;

    // Format large numbers for display
    const formatLargeNumber = (num) => {
      if (num >= 1000000) {
        return `$${(num / 1000000).toFixed(1)}M`;
      } else if (num >= 1000) {
        return `$${(num / 1000).toFixed(1)}K`;
      }
      return formatCurrency(num);
    };

    return (
      <svg width="100%" height={chartHeight} className="projection-chart" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const x = padding + chartAreaWidth * ratio;
          const value = maxValue * ratio;
          return (
            <g key={i}>
              <line
                x1={x}
                y1={padding}
                x2={x}
                y2={chartHeight - padding}
                stroke="#444"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
              <text
                x={x}
                y={chartHeight - padding + 15}
                fill="#666"
                fontSize="10"
                textAnchor="middle"
              >
                {formatLargeNumber(value)}
              </text>
            </g>
          );
        })}

        {/* Category bars */}
        {categoriesWithValues.map((category, index) => {
          const categoryValue = parseFloat(budgetCategories[category]);
          const totalValue = categoryValue * months;
          const barWidth = totalValue * scale;
          const y = padding + index * barHeight + barHeight * 0.1;
          const barY = y + barHeight * 0.3;
          const barHeightActual = barHeight * 0.4;
          
          return (
            <g key={category}>
              {/* Category bar */}
              <rect
                x={padding}
                y={barY}
                width={barWidth}
                height={barHeightActual}
                fill={getCategoryColor(category)}
                rx="3"
                ry="3"
              />
              
              {/* Category label */}
              <text
                x={padding - 10}
                y={barY + barHeightActual / 2 + 4}
                fill="#ccc"
                fontSize="12"
                textAnchor="end"
              >
                {formatCategoryName(category)}
              </text>
              
              {/* Value label on bar */}
              <text
                x={padding + barWidth + 10}
                y={barY + barHeightActual / 2 + 4}
                fill="#fff"
                fontSize="11"
                fontWeight="bold"
              >
                {formatLargeNumber(totalValue)}
              </text>
              
              {/* Monthly value label */}
              <text
                x={padding + barWidth + 10}
                y={barY + barHeightActual / 2 + 18}
                fill="#999"
                fontSize="9"
              >
                ({formatLargeNumber(categoryValue)}/month)
              </text>
            </g>
          );
        })}

        {/* Total income bar for comparison */}
        <g>
          <rect
            x={padding}
            y={padding + categoriesWithValues.length * barHeight + barHeight * 0.1}
            width={chartAreaWidth}
            height={barHeight * 0.4}
            fill="#28a745"
            opacity="0.3"
            rx="3"
            ry="3"
          />
          <text
            x={padding - 10}
            y={padding + categoriesWithValues.length * barHeight + barHeight * 0.3}
            fill="#ccc"
            fontSize="12"
            textAnchor="end"
          >
            Total Income
          </text>
          <text
            x={padding + chartAreaWidth + 10}
            y={padding + categoriesWithValues.length * barHeight + barHeight * 0.3}
            fill="#28a745"
            fontSize="11"
            fontWeight="bold"
          >
            {formatLargeNumber(income * months)}
          </text>
        </g>

        {/* Chart title */}
        <text
          x={chartWidth / 2}
          y={20}
          fill="#fff"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
        >
          Category Comparison - {getTimeFrameLabel()}
        </text>
      </svg>
    );
  };

  const formatCategoryName = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ');
  };

  return (
    <div>
      <header>Welcome to your Budget Calculator!</header>
      
      <div className="budget-form">
        <label htmlFor="payBox">How much will you be paid this month?</label>
        <input
          type="number"
          id="payBox"
          value={monthlyIncome}
          onChange={handleIncomeChange}
          placeholder="Enter amount"
        />
      </div>

      <div className="budget-container">
        <div className="budget-table-section">
          <div className="budget-header">
            <h3>Budget Breakdown</h3>
          </div>
          <div id="calcTable">
            <table className="budget-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Progress</th>
                  <th>Color</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {categoryOrder.map((category) => (
                  <tr 
                    key={category}
                    className={draggedItem === category ? 'dragging' : ''}
                    draggable
                    onDragStart={(e) => handleDragStart(e, category)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, category)}
                  >
                    <td className="category-name">
                      <span className="drag-handle">⋮⋮</span>
                      {editingCategory === category ? (
                        <input
                          type="text"
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          onBlur={() => saveCategoryName(category)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              saveCategoryName(category);
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <span onClick={() => startEditingCategory(category)}>{formatCategoryName(category)}</span>
                      )}
                      {editingCategory === category && (
                        <button 
                          className="cancel-edit-btn"
                          onClick={cancelEditing}
                          title="Cancel edit"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                    <td>
                      <input
                        type="number"
                        className="budget-input"
                        value={budgetCategories[category]}
                        onChange={(e) => handleCategoryChange(category, e.target.value)}
                        placeholder="0"
                      />
                    </td>
                    <td>
                      {renderProgressBar(category, budgetCategories[category])}
                    </td>
                    <td>
                      <input
                        type="color"
                        className="color-picker"
                        value={getCategoryColor(category)}
                        onChange={(e) => handleColorChange(category, e.target.value)}
                        title="Choose color"
                      />
                    </td>
                    <td>
                      <button 
                        className="delete-category-btn"
                        onClick={() => removeCategory(category)}
                        title="Delete category"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
                
                {/* Template row for adding new category */}
                <tr className="template-row">
                  <td className="category-name">
                    <span className="drag-handle">⋮⋮</span>
                    <input
                      type="text"
                      className="template-input"
                      placeholder="Enter category name..."
                      value={templateCategory}
                      onChange={(e) => setTemplateCategory(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          if (addCategoryFromTemplate(templateCategory)) {
                            setTemplateCategory('');
                          }
                        }
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="budget-input"
                      disabled
                      placeholder="0"
                    />
                  </td>
                  <td>
                    <div className="progress-container">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '0%' }}></div>
                      </div>
                      <span className="progress-text">0%</span>
                    </div>
                  </td>
                  <td>
                    <input
                      type="color"
                      className="color-picker"
                      disabled
                    />
                  </td>
                  <td>
                    <button 
                      className="add-category-btn"
                      onClick={() => {
                        if (addCategoryFromTemplate(templateCategory)) {
                          setTemplateCategory('');
                        }
                      }}
                      title="Add category"
                      disabled={!templateCategory.trim()}
                    >
                      +
                    </button>
                  </td>
                </tr>
                
                <tr className="total-row">
                  <td><strong>Total Allocated</strong></td>
                  <td><strong>{formatCurrency(calculateTotal())}</strong></td>
                  <td>
                    <div className="progress-container">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill total-progress"
                          style={{ 
                            width: `${Math.min((calculateTotal() / parseFloat(monthlyIncome || 1)) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {monthlyIncome ? `${((calculateTotal() / parseFloat(monthlyIncome)) * 100).toFixed(1)}%` : '0%'}
                      </span>
                    </div>
                  </td>
                  <td></td>
                  <td></td>
                </tr>
                <tr className="remaining-row">
                  <td><strong>Remaining</strong></td>
                  <td><strong>{formatCurrency(calculateRemaining())}</strong></td>
                  <td>
                    <div className="progress-container">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill remaining-progress"
                          style={{ 
                            width: `${Math.min((calculateRemaining() / parseFloat(monthlyIncome || 1)) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {monthlyIncome ? `${((calculateRemaining() / parseFloat(monthlyIncome)) * 100).toFixed(1)}%` : '0%'}
                      </span>
                    </div>
                  </td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="visualization-section">
          {renderPieChart()}
        </div>
      </div>

      {renderProjectedTotals()}
    </div>
  );
};

export default BudgetCalculator; 