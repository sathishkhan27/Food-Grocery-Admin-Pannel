import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'customer_app.dart';
import 'driver_onboarding.dart';
import 'admin_dashboard.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (context) => AppState(),
      child: const PingZoApp(),
    ),
  );
}

class PingZoApp extends StatelessWidget {
  const PingZoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PingZo',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        primaryColor: const Color(0xFFE01460),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFE01460),
          primary: const Color(0xFFE01460),
        ),
      ),
      home: const RoleNavigationShell(),
    );
  }
}

/// A top-level navigator that lets users simulate Customer, Driver, and Admin views
class RoleNavigationShell extends StatefulWidget {
  const RoleNavigationShell({super.key});

  @override
  State<RoleNavigationShell> createState() => _RoleNavigationShellState();
}

class _RoleNavigationShellState extends State<RoleNavigationShell> {
  int _currentRoleIndex = 0;

  final List<Widget> _screens = [
    const CustomerAppScreen(),
    const DriverOnboardingScreen(),
    const AdminDashboardScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentRoleIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          border: Border(
            top: BorderSide(color: Colors.grey.shade200, width: 1),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentRoleIndex,
          onTap: (index) {
            setState(() {
              _currentRoleIndex = index;
            });
          },
          selectedItemColor: const Color(0xFFE01460),
          unselectedItemColor: Colors.grey,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
          unselectedLabelStyle: const TextStyle(fontSize: 10),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.shopping_bag_outlined),
              activeIcon: Icon(Icons.shopping_bag),
              label: 'Customer App',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.delivery_dining_outlined),
              activeIcon: Icon(Icons.delivery_dining),
              label: 'Driver Onboarding',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.admin_panel_settings_outlined),
              activeIcon: Icon(Icons.admin_panel_settings),
              label: 'Control Panel',
            ),
          ],
        ),
      ),
    );
  }
}

// ==========================================================================
// MODELS
// ==========================================================================

class MenuItem {
  final String id;
  final String name;
  final String category;
  final double price;
  final double? oldPrice;
  final String imageUrl;

  const MenuItem({
    required this.id,
    required this.name,
    required this.category,
    required this.price,
    this.oldPrice,
    required this.imageUrl,
  });
}

class Driver {
  final String id;
  final String name;
  final String phone;
  final String vehicle;
  final String plateNumber;
  final String avatarUrl;
  final String backgroundStatus; // "approved" or "pending"
  final String status; // "offline", "idle", "delivering"

  Driver({
    required this.id,
    required this.name,
    required this.phone,
    required this.vehicle,
    required this.plateNumber,
    required this.avatarUrl,
    required this.backgroundStatus,
    required this.status,
  });

  Driver copyWith({
    String? backgroundStatus,
    String? status,
  }) {
    return Driver(
      id: id,
      name: name,
      phone: phone,
      vehicle: vehicle,
      plateNumber: plateNumber,
      avatarUrl: avatarUrl,
      backgroundStatus: backgroundStatus ?? this.backgroundStatus,
      status: status ?? this.status,
    );
  }
}

class Order {
  final String id;
  final List<Map<String, dynamic>> items;
  final double totalAmount;
  final String status;

  const Order({
    required this.id,
    required this.items,
    required this.totalAmount,
    required this.status,
  });
}

// ==========================================================================
// CENTRAL STATE MANAGEMENT
// ==========================================================================

class AppState extends ChangeNotifier {
  // Inventory Map matching standard keys and stock numbers
  final Map<String, int> _inventory = {
    "g_veg_1": 15,
    "g_veg_2": 25,
    "g_veg_3": 12,
    "g_veg_4": 18,
    "g_veg_5": 30,
    "g_fr_1": 10,
    "g_fr_2": 8,
    "g_fr_3": 14,
    "g_deal_1": 4,
    "g_deal_2": 6,
    "g_deal_3": 2,
    "m_1": 20,
    "m_2": 15,
    "m_3": 18,
  };

  // Drivers list mimicking registered drivers database
  final List<Driver> _drivers = [
    Driver(
      id: "dr_1",
      name: "Rajesh Kumar",
      phone: "+91 98765 43210",
      vehicle: "Electric Hero Nyx",
      plateNumber: "DL-3S-CH-4892",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      backgroundStatus: "approved",
      status: "idle",
    ),
    Driver(
      id: "dr_2",
      name: "Amit Sharma",
      phone: "+91 99887 76655",
      vehicle: "Ola S1 Pro Electric",
      plateNumber: "MH-12-PQ-7729",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      backgroundStatus: "approved",
      status: "offline",
    ),
  ];

  // User Shopping Cart
  final Map<String, int> _cart = {};

  // List of Orders
  final List<Order> _orders = [];

  // Getters
  Map<String, int> get inventory => _inventory;
  List<Driver> get drivers => _drivers;
  Map<String, int> get cart => _cart;
  List<Order> get orders => _orders;

  // Inventory logic
  int getStock(String itemId) => _inventory[itemId] ?? 0;

  void updateStock(String itemId, int quantity) {
    _inventory[itemId] = quantity >= 0 ? quantity : 0;
    notifyListeners();
  }

  // Cart operations with stock safety checks
  bool addToCart(String itemId) {
    final currentStock = getStock(itemId);
    final inCart = _cart[itemId] ?? 0;

    if (inCart < currentStock) {
      _cart[itemId] = inCart + 1;
      notifyListeners();
      return true;
    }
    return false; // Out of stock limit reached
  }

  void removeFromCart(String itemId) {
    final inCart = _cart[itemId] ?? 0;
    if (inCart > 1) {
      _cart[itemId] = inCart - 1;
    } else {
      _cart.remove(itemId);
    }
    notifyListeners();
  }

  void clearCart() {
    _cart.clear();
    notifyListeners();
  }

  // Driver approvals
  void registerDriver(String name, String phone, String vehicle, String plate) {
    final newDriver = Driver(
      id: "dr_${_drivers.length + 1}",
      name: name,
      phone: phone,
      vehicle: vehicle,
      plateNumber: plate.isNotEmpty ? plate : "PZ-${_drivers.length + 1000}",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      backgroundStatus: "pending",
      status: "offline",
    );
    _drivers.add(newDriver);
    notifyListeners();
  }

  void approveDriver(String driverId) {
    final index = _drivers.indexWhere((d) => d.id == driverId);
    if (index != -1) {
      _drivers[index] = _drivers[index].copyWith(
        backgroundStatus: "approved",
        status: "offline",
      );
      notifyListeners();
    }
  }

  void toggleDriverOnline(String driverId) {
    final index = _drivers.indexWhere((d) => d.id == driverId);
    if (index != -1) {
      final currentStatus = _drivers[index].status;
      _drivers[index] = _drivers[index].copyWith(
        status: currentStatus == "offline" ? "idle" : "offline",
      );
      notifyListeners();
    }
  }

  // Stock deduction on Checkout
  bool checkout() {
    if (_cart.isEmpty) return false;

    // Check all item stock levels first
    for (var entry in _cart.entries) {
      if (getStock(entry.key) < entry.value) {
        return false; // Insufficient stock
      }
    }

    // Deduct stock and record order
    List<Map<String, dynamic>> itemsList = [];
    double total = 0.0;
    
    _cart.forEach((itemId, qty) {
      _inventory[itemId] = _inventory[itemId]! - qty;
      itemsList.add({"id": itemId, "qty": qty});
    });

    final newOrder = Order(
      id: "ORD-${_orders.length + 1000}",
      items: itemsList,
      totalAmount: 149.0 + (itemsList.length * 20), // mock pricing calculation
      status: "pending",
    );

    _orders.add(newOrder);
    _cart.clear();
    notifyListeners();
    return true;
  }
}
