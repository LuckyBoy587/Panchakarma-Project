import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Package, Home, Plus, Edit2, CheckCircle, XCircle, Wrench } from 'lucide-react';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [stock, setStock] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [stockForm, setStockForm] = useState({
    itemId: '',
    itemName: '',
    quantity: '',
    unit: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const selectRef = useRef(null);

  useEffect(() => {
    fetchData();
    loadAvailableItems();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadAvailableItems = async () => {
    try {
      const response = await axios.get('/api/staff/stock-items');
      setAvailableItems(response.data);
    } catch (error) {
      console.error('Error loading available items:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stockResponse, roomsResponse] = await Promise.all([
        axios.get('/api/staff/stock'),
        axios.get('/api/staff/rooms')
      ]);
      setStock(stockResponse.data);
      setRooms(roomsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from available items
  const categories = ['All', ...new Set(availableItems.map(item => item.category))];

  // Filter items based on search term and selected category
  const filteredItems = availableItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous validation errors
    setValidationErrors({});
    
    // Validation for adding new items
    if (!editingStock) {
      const errors = {};
      
      if (!stockForm.itemId) {
        errors.item = 'Please select an item';
      }
      
      if (!stockForm.quantity || parseInt(stockForm.quantity) <= 0) {
        errors.quantity = 'Please enter a valid quantity greater than 0';
      }
      
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
    }
    
    // Handle editing with quantity 0 (delete item)
    if (editingStock && parseInt(stockForm.quantity) === 0) {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete "${stockForm.itemName}" from stock?`
      );
      
      if (!confirmDelete) {
        return;
      }
      
      try {
        await axios.delete(`/api/staff/stock/${editingStock.id}`);
        setShowStockModal(false);
        setEditingStock(null);
        setStockForm({ itemId: '', itemName: '', quantity: '', unit: '' });
        fetchData();
        return;
      } catch (error) {
        console.error('Error deleting stock:', error);
        return;
      }
    }
    
    // Validation for editing (quantity must be valid)
    if (editingStock) {
      const quantity = parseInt(stockForm.quantity);
      if (!stockForm.quantity || quantity < 0) {
        setValidationErrors({ quantity: 'Please enter a valid quantity (0 to delete)' });
        return;
      }
    }
    
    try {
      if (editingStock) {
        await axios.put(`/api/staff/stock/${editingStock.id}`, {
          itemName: stockForm.itemName,
          quantity: parseInt(stockForm.quantity),
          unit: stockForm.unit
        });
      } else {
        await axios.post('/api/staff/stock', {
          itemName: stockForm.itemName,
          quantity: parseInt(stockForm.quantity),
          unit: stockForm.unit
        });
      }
      setShowStockModal(false);
      setEditingStock(null);
      setStockForm({ itemId: '', itemName: '', quantity: '', unit: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving stock:', error);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setIsDropdownOpen(true);
  };

  const handleItemSelect = (itemId) => {
    const selectedItem = availableItems.find(item => item.id.toString() === itemId);
    if (selectedItem) {
      setStockForm({
        ...stockForm,
        itemId: itemId,
        itemName: selectedItem.name,
        unit: selectedItem.unit
      });
      // Clear item validation error when item is selected
      if (validationErrors.item) {
        setValidationErrors({...validationErrors, item: ''});
      }
    }
    setIsDropdownOpen(false);
  };

  const handleEditStock = (item) => {
    // Find the item in available items to get the ID
    const availableItem = availableItems.find(availItem => availItem.name === item.item_name);
    
    setEditingStock(item);
    setStockForm({
      itemId: availableItem ? availableItem.id.toString() : '',
      itemName: item.item_name,
      quantity: item.quantity.toString(),
      unit: item.unit
    });
    setSearchTerm('');
    setSelectedCategory('All');
    setIsDropdownOpen(false);
    setValidationErrors({});
    setShowStockModal(true);
  };

  const handleRoomStatusUpdate = async (roomId, newStatus) => {
    try {
      await axios.put(`/api/staff/rooms/${roomId}`, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error('Error updating room status:', error);
    }
  };

  const getRoomStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'text-green-600 bg-green-100';
      case 'occupied':
        return 'text-red-600 bg-red-100';
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoomStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4" />;
      case 'occupied':
        return <XCircle className="h-4 w-4" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Staff Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Manage inventory and room availability
        </p>
      </div>

      {/* Stock Management Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Stock Management
          </h2>
          <button
            onClick={() => {
              setEditingStock(null);
              setStockForm({ itemId: '', itemName: '', quantity: '', unit: '' });
              setSearchTerm('');
              setSelectedCategory('All');
              setIsDropdownOpen(false);
              setValidationErrors({});
              setShowStockModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </button>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stock.map((item) => {
                  const availableItem = availableItems.find(availItem => availItem.name === item.item_name);
                  return (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.item_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {availableItem ? availableItem.category : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.last_updated).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.first_name} {item.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditStock(item)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Room Management Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Home className="h-5 w-5 mr-2" />
            Room Management
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div key={room.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{room.room_name}</h3>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getRoomStatusColor(room.status)}`}>
                    {getRoomStatusIcon(room.status)}
                    <span className="ml-1 capitalize">{room.status}</span>
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    Last updated: {new Date(room.last_updated).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Updated by: {room.first_name} {room.last_name}
                  </p>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleRoomStatusUpdate(room.id, 'available')}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                  >
                    Available
                  </button>
                  <button
                    onClick={() => handleRoomStatusUpdate(room.id, 'occupied')}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                  >
                    Occupied
                  </button>
                  <button
                    onClick={() => handleRoomStatusUpdate(room.id, 'maintenance')}
                    className="flex-1 bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700"
                  >
                    Maintenance
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingStock ? 'Edit Stock Item' : 'Add New Stock Item'}
              </h3>
              <form onSubmit={handleStockSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Item
                  </label>
                  
                  {/* Search Input */}
                  <div className="relative mb-2">
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  
                  {/* Category Filter Buttons */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleCategorySelect(category)}
                        className={`px-3 py-1 text-xs rounded-full ${
                          selectedCategory === category
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom Dropdown */}
                  <div className="relative" ref={selectRef}>
                    <div
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 cursor-pointer bg-white flex justify-between items-center ${
                        validationErrors.item 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    >
                      <span className={stockForm.itemId ? 'text-gray-900' : 'text-gray-500'}>
                        {stockForm.itemId 
                          ? `${stockForm.itemName} (${availableItems.find(item => item.id.toString() === stockForm.itemId)?.category})`
                          : (filteredItems.length === 0 
                              ? 'No items found' 
                              : `Select an item... (${filteredItems.length} available)`)
                        }
                      </span>
                      <svg 
                        className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    
                    {validationErrors.item && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.item}</p>
                    )}
                    
                    {isDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredItems.length === 0 ? (
                          <div className="px-3 py-2 text-gray-500 text-sm">No items found</div>
                        ) : (
                          filteredItems.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleItemSelect(item.id.toString())}
                              className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{item.name}</div>
                              <div className="text-xs text-gray-500">{item.category}</div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={stockForm.itemName}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={stockForm.quantity}
                    onChange={(e) => {
                      setStockForm({...stockForm, quantity: e.target.value});
                      // Clear quantity validation error when user starts typing
                      if (validationErrors.quantity) {
                        setValidationErrors({...validationErrors, quantity: ''});
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      validationErrors.quantity 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    required
                    min="0"
                  />
                  {validationErrors.quantity && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.quantity}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={stockForm.unit}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowStockModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    {editingStock ? 'Update' : 'Add'} Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
