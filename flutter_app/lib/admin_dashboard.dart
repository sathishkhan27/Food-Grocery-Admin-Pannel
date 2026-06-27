import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'main.dart';
import 'customer_app.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  String _activeTab = "stock"; // "stock" or "approvals"

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final drivers = appState.drivers;
    final pendingDrivers = drivers.where((d) => d.backgroundStatus == "pending").toList();

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.admin_panel_settings, color: Color(0xFFE01460)),
            SizedBox(width: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Operations Control Panel',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.black, letterSpacing: -0.5),
                ),
                Text(
                  'SOMA Fleet Logistics & Stock Hub',
                  style: TextStyle(fontSize: 8, color: Colors.grey, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ],
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
      ),
      body: Column(
        children: [
          // Sub-Tab Navigation Header
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Row(
              children: [
                _buildTabButton(
                  title: "Category Stocks",
                  icon: Icons.layers_outlined,
                  isActive: _activeTab == "stock",
                  onTap: () {
                    setState(() {
                      _activeTab = "stock";
                    });
                  },
                ),
                _buildTabButton(
                  title: "Onboarding Approvals",
                  icon: Icons.assignment_turned_in_outlined,
                  isActive: _activeTab == "approvals",
                  badgeCount: pendingDrivers.length,
                  onTap: () {
                    setState(() {
                      _activeTab = "approvals";
                    });
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // Main View Content
          Expanded(
            child: _activeTab == "stock"
                ? _buildCategoryStockView(context, appState)
                : _buildOnboardingApprovalsView(context, pendingDrivers, appState),
          ),
        ],
      ),
    );
  }

  // Segment Tab Buttons
  Widget _buildTabButton({
    required String title,
    required IconData icon,
    required bool isActive,
    int badgeCount = 0,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(
                color: isActive ? const Color(0xFFE01460) : Colors.transparent,
                width: 2,
              ),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 16, color: isActive ? const Color(0xFFE01460) : Colors.grey),
              const SizedBox(width: 6),
              Text(
                title,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: isActive ? FontWeight.black : FontWeight.bold,
                  color: isActive ? const Color(0xFFE01460) : Colors.grey.shade600,
                ),
              ),
              if (badgeCount > 0) ...[
                const SizedBox(width: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.red.shade600,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    '$badgeCount',
                    style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.black),
                  ),
                )
              ]
            ],
          ),
        ),
      ),
    );
  }

  // WIDGET 1: CATEGORY-BASED PRODUCT STOCK LISTS
  Widget _buildCategoryStockView(BuildContext context, AppState appState) {
    final List<String> categories = ["Vegetables", "Fruits", "Pantry", "Food"];

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(12, 4, 12, 24),
      itemCount: categories.length,
      itemBuilder: (context, catIdx) {
        final category = categories[catIdx];
        final catItems = groceryItems.where((item) => item.category == category).toList();

        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Category Title
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    category.toUpperCase(),
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.black,
                      color: Color(0xFFE01460),
                      letterSpacing: 0.5,
                    ),
                  ),
                  Text(
                    '${catItems.length} Products',
                    style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              const Divider(height: 1),
              const SizedBox(height: 12),

              // Items Stock Inputs
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: catItems.length,
                itemBuilder: (context, itemIdx) {
                  final item = catItems[itemIdx];
                  final stock = appState.getStock(item.id);

                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade50,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.shade150),
                    ),
                    child: Row(
                      children: [
                        // Image Mock
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.grey.shade200),
                          ),
                          clipBehavior: Clip.antiAlias,
                          child: Image.network(item.imageUrl, fit: BoxFit.cover),
                        ),
                        const SizedBox(width: 10),

                        // Item details and status
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                item.name,
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.black),
                              ),
                              const SizedBox(height: 2),
                              if (stock == 0)
                                Text(
                                  'OUT OF STOCK',
                                  style: TextStyle(fontSize: 8, color: Colors.red.shade600, fontWeight: FontWeight.black),
                                )
                              else if (stock <= 5)
                                Text(
                                  'LOW STOCK ($stock)',
                                  style: TextStyle(fontSize: 8, color: Colors.amber.shade800, fontWeight: FontWeight.black),
                                )
                              else
                                Text(
                                  '$stock Available',
                                  style: const TextStyle(fontSize: 8, color: Colors.green, fontWeight: FontWeight.bold),
                                )
                            ],
                          ),
                        ),

                        // Stock Input Field (Tap to edit)
                        Container(
                          width: 64,
                          height: 32,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.grey.shade300),
                          ),
                          child: TextFormField(
                            key: ValueKey('${item.id}_$stock'), // re-key to update UI instantly
                            initialValue: '$stock',
                            keyboardType: TextInputType.number,
                            textAlign: TextAlign.center,
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.black),
                            decoration: const InputDecoration(
                              border: InputBorder.none,
                              contentPadding: EdgeInsets.zero,
                            ),
                            onFieldSubmitted: (val) {
                              final parsed = int.tryParse(val);
                              if (parsed != null && parsed >= 0) {
                                appState.updateStock(item.id, parsed);
                              }
                            },
                          ),
                        ),
                      ],
                    ),
                  );
                },
              )
            ],
          ),
        );
      },
    );
  }

  // WIDGET 2: DRIVER ONBOARDING QUEUE VIEW
  Widget _buildOnboardingApprovalsView(BuildContext context, List<Driver> pendingDrivers, AppState appState) {
    if (pendingDrivers.isEmpty) {
      return Center(
        child: Container(
          margin: const EdgeInsets.all(24),
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.check_circle_outline, size: 48, color: Colors.green.shade400),
              const SizedBox(height: 12),
              const Text(
                'Onboarding Queue Clear',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.black),
              ),
              const SizedBox(height: 6),
              const Text(
                'There are no pending driver partner registrations awaiting review.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 10, color: Colors.grey),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      itemCount: pendingDrivers.length,
      itemBuilder: (context, index) {
        final driver = pendingDrivers[index];

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundImage: NetworkImage(driver.avatarUrl),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          driver.name,
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.black),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          driver.phone,
                          style: TextStyle(fontSize: 9, color: Colors.grey.shade500, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  )
                ],
              ),
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.shade150),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildMetaRow('Vehicle Class', driver.vehicle),
                    const SizedBox(height: 6),
                    _buildMetaRow('License Plate', driver.plateNumber),
                    const SizedBox(height: 6),
                    _buildMetaRow('Background Scans', 'Clear (State Registry Passed)', isGreen: true),
                    const SizedBox(height: 6),
                    _buildMetaRow('DMV Driving License', 'Valid & Authenticated', isGreen: true),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 38,
                child: ElevatedButton(
                  onPressed: () {
                    appState.approveDriver(driver.id);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Driver ${driver.name} has been approved and onboarded!')),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green.shade600,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Verify Credentials & Onboard Rider', style: TextStyle(fontSize: 11, fontWeight: FontWeight.black)),
                ),
              )
            ],
          ),
        );
      },
    );
  }

  Widget _buildMetaRow(String label, String val, {bool isGreen = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 9, color: Colors.grey, fontWeight: FontWeight.bold),
        ),
        Text(
          val,
          style: TextStyle(
            fontSize: 9,
            color: isGreen ? Colors.green.shade700 : Colors.black87,
            fontWeight: FontWeight.black,
          ),
        ),
      ],
    );
  }
}
