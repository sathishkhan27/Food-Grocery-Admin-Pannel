import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'main.dart';

final List<MenuItem> groceryItems = [
  const MenuItem(
    id: "g_veg_1",
    name: "Coriander Leaves",
    category: "Vegetables",
    price: 12,
    oldPrice: 19,
    imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200",
  ),
  const MenuItem(
    id: "g_veg_2",
    name: "Tomato Local",
    category: "Vegetables",
    price: 28,
    oldPrice: 35,
    imageUrl: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=200",
  ),
  const MenuItem(
    id: "g_veg_3",
    name: "Onion Local",
    category: "Vegetables",
    price: 34,
    oldPrice: 42,
    imageUrl: "https://images.unsplash.com/photo-1508747703725-719777637510?w=200",
  ),
  const MenuItem(
    id: "g_veg_4",
    name: "Mint Leaves",
    category: "Vegetables",
    price: 15,
    oldPrice: 20,
    imageUrl: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=200",
  ),
  const MenuItem(
    id: "g_veg_5",
    name: "Sweet Orange Carrots",
    category: "Vegetables",
    price: 49,
    oldPrice: 60,
    imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200",
  ),
  const MenuItem(
    id: "g_fr_1",
    name: "Fresh Banana Robusta",
    category: "Fruits",
    price: 55,
    oldPrice: 70,
    imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200",
  ),
  const MenuItem(
    id: "g_fr_2",
    name: "Shimla Red Apples",
    category: "Fruits",
    price: 189,
    oldPrice: 220,
    imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200",
  ),
  const MenuItem(
    id: "g_fr_3",
    name: "Sweet Papaya",
    category: "Fruits",
    price: 79,
    oldPrice: 95,
    imageUrl: "https://images.unsplash.com/photo-1526434426575-105f96e7f2be?w=200",
  ),
  const MenuItem(
    id: "g_deal_1",
    name: "Bellavita CEO Perfume",
    category: "Pantry",
    price: 399,
    oldPrice: 599,
    imageUrl: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=200",
  ),
  const MenuItem(
    id: "g_deal_2",
    name: "Plum Green Face Wash",
    category: "Pantry",
    price: 249,
    oldPrice: 325,
    imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200",
  ),
  const MenuItem(
    id: "g_deal_3",
    name: "Special Atta Premium Pack",
    category: "Pantry",
    price: 420,
    oldPrice: 480,
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200",
  ),
  const MenuItem(
    id: "m_1",
    name: "Premium Truffle Burger",
    category: "Food",
    price: 299,
    oldPrice: 349,
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200",
  ),
  const MenuItem(
    id: "m_2",
    name: "Neapolitan Burrata Pizza",
    category: "Food",
    price: 449,
    oldPrice: 499,
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200",
  ),
  const MenuItem(
    id: "m_3",
    name: "Spicy Salmon Crunch Roll",
    category: "Food",
    price: 380,
    oldPrice: 420,
    imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200",
  ),
];

class CustomerAppScreen extends StatefulWidget {
  const CustomerAppScreen({super.key});

  @override
  State<CustomerAppScreen> createState() => _CustomerAppScreenState();
}

class _CustomerAppScreenState extends State<CustomerAppScreen> {
  String _selectedCategory = "All";
  final List<String> _categories = ["All", "Vegetables", "Fruits", "Pantry", "Food"];

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final cart = appState.cart;

    // Filter items based on category
    final filteredItems = _selectedCategory == "All"
        ? groceryItems
        : groceryItems.where((item) => item.category == _selectedCategory).toList();

    // Calculate cart totals
    double subtotal = 0.0;
    cart.forEach((itemId, qty) {
      final item = groceryItems.firstWhere((i) => i.id == itemId);
      subtotal += item.price * qty;
    });

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 8,
              height: 24,
              decoration: BoxDecoration(
                color: const Color(0xFFE01460),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(width: 8),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'SOMA Organic Grocers',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.black, letterSpacing: -0.5),
                ),
                Text(
                  'Delivering Fresh in Under 15 Mins',
                  style: TextStyle(fontSize: 9, color: Colors.grey, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ],
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
        actions: [
          IconButton(
            icon: const Icon(Icons.search, size: 20),
            onPressed: () {},
          )
        ],
      ),
      body: Stack(
        children: [
          Column(
            children: [
              // Horizontal Category List Filter
              Container(
                height: 48,
                color: Colors.white,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  itemCount: _categories.length,
                  itemBuilder: (context, index) {
                    final cat = _categories[index];
                    final isSelected = cat == _selectedCategory;
                    return GestureDetector(
                      onTap: () {
                        setState(() {
                          _selectedCategory = cat;
                        });
                      },
                      child: Container(
                        margin: const EdgeInsets.only(right: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFFE01460) : Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          cat,
                          style: TextStyle(
                            color: isSelected ? Colors.white : Colors.slate.shade750,
                            fontSize: 11,
                            fontWeight: FontWeight.black,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),

              // Product Grid Layout
              Expanded(
                child: GridView.builder(
                  padding: const EdgeInsets.fromLTRB(12, 12, 12, 120), // padded bottom for checkout bar
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.72,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                  ),
                  itemCount: filteredItems.length,
                  itemBuilder: (context, index) {
                    final item = filteredItems[index];
                    final qtyInCart = cart[item.id] ?? 0;
                    final stock = appState.getStock(item.id);
                    final isOutOfStock = stock == 0;

                    return Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.grey.shade200),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.02),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Image with Out of Stock overlay & Low Stock alert
                          Expanded(
                            child: Stack(
                              children: [
                                Container(
                                  width: double.infinity,
                                  color: Colors.grey.shade50,
                                  child: isOutOfStock
                                      ? ColorFiltered(
                                          colorFilter: const ColorFilter.mode(
                                            Colors.grey,
                                            BlendMode.saturation,
                                          ),
                                          child: Image.network(
                                            item.imageUrl,
                                            fit: BoxFit.cover,
                                          ),
                                        )
                                      : Image.network(
                                          item.imageUrl,
                                          fit: BoxFit.cover,
                                        ),
                                ),

                                // OUT OF STOCK BADGE OVERLAY
                                if (isOutOfStock)
                                  Container(
                                    color: Colors.black.withOpacity(0.4),
                                    alignment: Alignment.center,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: Colors.red.shade600,
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: const Text(
                                        'SOLD OUT',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 9,
                                          fontWeight: FontWeight.black,
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                                    ),
                                  )

                                // LOW STOCK BADGE
                                else if (stock <= 5)
                                  Positioned(
                                    top: 8,
                                    left: 8,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: Colors.amber.shade700,
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Text(
                                        '$stock LEFT',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 8,
                                          fontWeight: FontWeight.black,
                                        ),
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ),

                          // Details and Action Button
                          Padding(
                            padding: const EdgeInsets.all(10),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Pricing
                                Row(
                                  children: [
                                    Text(
                                      '₹${item.price.toStringAsFixed(0)}',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.black,
                                        color: Colors.green,
                                      ),
                                    ),
                                    const SizedBox(width: 4),
                                    if (item.oldPrice != null)
                                      Text(
                                        '₹${item.oldPrice!.toStringAsFixed(0)}',
                                        style: TextStyle(
                                          fontSize: 10,
                                          color: Colors.grey.shade400,
                                          decoration: TextDecoration.lineThrough,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                  ],
                                ),
                                const SizedBox(height: 4),

                                // Item Name
                                Text(
                                  item.name,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.black87,
                                    height: 1.2,
                                  ),
                                ),
                                const SizedBox(height: 8),

                                // Action Buttons (Add / Incrementors)
                                SizedBox(
                                  width: double.infinity,
                                  height: 32,
                                  child: isOutOfStock
                                      ? OutlinedButton(
                                          onPressed: null,
                                          style: OutlinedButton.styleFrom(
                                            side: BorderSide(color: Colors.grey.shade300),
                                            shape: RoundedRectangleBorder(
                                              borderRadius: BorderRadius.circular(10),
                                            ),
                                          ),
                                          child: const Text(
                                            'SOLD OUT',
                                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                                          ),
                                        )
                                      : qtyInCart > 0
                                          ? Container(
                                              decoration: BoxDecoration(
                                                color: const Color(0xFFE01460),
                                                borderRadius: BorderRadius.circular(10),
                                              ),
                                              child: Row(
                                                mainAxisAlignment: MainAxisAlignment.spaceAround,
                                                children: [
                                                  IconButton(
                                                    icon: const Icon(Icons.remove, size: 14, color: Colors.white),
                                                    onPressed: () => appState.removeFromCart(item.id),
                                                    padding: EdgeInsets.zero,
                                                    constraints: const BoxConstraints(),
                                                  ),
                                                  Text(
                                                    '$qtyInCart',
                                                    style: const TextStyle(
                                                      color: Colors.white,
                                                      fontSize: 11,
                                                      fontWeight: FontWeight.black,
                                                    ),
                                                  ),
                                                  IconButton(
                                                    icon: const Icon(Icons.add, size: 14, color: Colors.white),
                                                    onPressed: () {
                                                      final success = appState.addToCart(item.id);
                                                      if (!success) {
                                                        ScaffoldMessenger.of(context).showSnackBar(
                                                          const SnackBar(
                                                            content: Text('Out of Stock limit reached!'),
                                                            duration: Duration(seconds: 1),
                                                          ),
                                                        );
                                                      }
                                                    },
                                                    padding: EdgeInsets.zero,
                                                    constraints: const BoxConstraints(),
                                                  ),
                                                ],
                                              ),
                                            )
                                          : OutlinedButton(
                                              onPressed: () {
                                                appState.addToCart(item.id);
                                              },
                                              style: OutlinedButton.styleFrom(
                                                side: const BorderSide(color: Color(0xFFE01460)),
                                                foregroundColor: const Color(0xFFE01460),
                                                shape: RoundedRectangleBorder(
                                                  borderRadius: BorderRadius.circular(10),
                                                ),
                                              ),
                                              child: const Text(
                                                'ADD TO CART',
                                                style: TextStyle(fontSize: 10, fontWeight: FontWeight.black),
                                              ),
                                            ),
                                ),
                              ],
                            ),
                          )
                        ],
                      ),
                    );
                  },
                ),
              ),
            ],
          ),

          // Instant Checkout Floating Drawer/Bar
          if (cart.isNotEmpty)
            Positioned(
              bottom: 12,
              left: 12,
              right: 12,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B), // Slate 800 dark matching SOMA
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    )
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          '${cart.length} ITEMS',
                          style: const TextStyle(
                            color: Colors.greenAccent,
                            fontSize: 9,
                            fontWeight: FontWeight.black,
                            letterSpacing: 0.5,
                          ),
                        ),
                        Text(
                          '₹${(subtotal + 149).toStringAsFixed(0)} total',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 15,
                            fontWeight: FontWeight.black,
                          ),
                        ),
                      ],
                    ),
                    ElevatedButton(
                      onPressed: () {
                        final success = appState.checkout();
                        if (success) {
                          showDialog(
                            context: context,
                            builder: (context) => AlertDialog(
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                              title: const Row(
                                children: [
                                  Icon(Icons.check_circle, color: Colors.green),
                                  SizedBox(width: 8),
                                  Text('Order Placed!'),
                                ],
                              ),
                              content: const Text(
                                'Thank you for your order! Your SOMA organic grocery checkout succeeded. Stock has been deducted from central servers.',
                              ),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.pop(context),
                                  child: const Text('OK'),
                                )
                              ],
                            ),
                          );
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFE01460),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: const Row(
                        children: [
                          Text('Checkout'),
                          SizedBox(width: 4),
                          Icon(Icons.arrow_forward_ios, size: 12),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
