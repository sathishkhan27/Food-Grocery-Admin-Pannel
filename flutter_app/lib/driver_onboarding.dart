import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'main.dart';

class DriverOnboardingScreen extends StatefulWidget {
  const DriverOnboardingScreen({super.key});

  @override
  State<DriverOnboardingScreen> createState() => _DriverOnboardingScreenState();
}

class _DriverOnboardingScreenState extends State<DriverOnboardingScreen> {
  // Simulator: Selected rider identity to view active status
  String? _selectedDriverId;
  
  // Registration Form Controllers
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _plateController = TextEditingController();
  String _selectedVehicle = "Electric Scooter (2-Wheeler)";

  final List<String> _vehicles = [
    "Electric Scooter (2-Wheeler)",
    "Rider Bicycle (Eco-Friendly)",
    "Motorcycle (Gasoline)",
    "Mini-Truck (Heavy-Duty Cargo)"
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _plateController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final drivers = appState.drivers;

    // Default driver selection
    if (_selectedDriverId == null && drivers.isNotEmpty) {
      _selectedDriverId = drivers.first.id;
    }

    // Find active simulated driver
    final activeDriver = drivers.firstWhere(
      (d) => d.id == _selectedDriverId,
      orElse: () => drivers.first,
    );

    final isPending = activeDriver.backgroundStatus == "pending";

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.delivery_dining, color: Colors.orange),
            SizedBox(width: 8),
            Text(
              'Driver Partner Console',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.black),
            ),
          ],
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Quick simulator identity switcher
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'SIMULATION IDENTITY SWITCHER',
                    style: TextStyle(fontSize: 8, fontWeight: FontWeight.black, color: Colors.grey),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Expanded(
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: _selectedDriverId,
                            isExpanded: true,
                            style: const TextStyle(fontSize: 12, color: Colors.black, fontWeight: FontWeight.bold),
                            items: drivers.map((d) {
                              return DropdownMenuItem<String>(
                                value: d.id,
                                child: Text('${d.name} (${d.backgroundStatus.toUpperCase()})'),
                              );
                            }).toList(),
                            onChanged: (val) {
                              setState(() {
                                _selectedDriverId = val;
                              });
                            },
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: () {
                          _showRegistrationDialog(context, appState);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.grey.shade200,
                          foregroundColor: Colors.black,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        ),
                        child: const Text('+ Register', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                      )
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // If selected driver is Pending Verification
            if (isPending)
              Container(
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
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: Colors.orange.shade50,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(Icons.timer_outlined, color: Colors.orange.shade800),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Application Pending Approval',
                                style: TextStyle(fontSize: 13, fontWeight: FontWeight.black),
                              ),
                              SizedBox(height: 2),
                              Text(
                                'Verification Code: PZ-A9828',
                                style: TextStyle(fontSize: 9, color: Colors.grey, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        )
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Thank you for applying as a PingZo driver partner! SOMA organic logistics team is currently performing background registry verification checks on your profile.',
                      style: TextStyle(fontSize: 11, color: Colors.black54, height: 1.4),
                    ),
                    const SizedBox(height: 20),

                    // CHECKPOINT TIMELINE WIDGET
                    _buildTimelineStep(
                      stepNum: "1",
                      title: "Credentials Uploaded",
                      desc: "Government PAN card, driving license and plate scans validated.",
                      isDone: true,
                    ),
                    _buildTimelineStep(
                      stepNum: "2",
                      title: "DMV Driving History Check",
                      desc: "Criminal registries and vehicle validation records clear.",
                      isDone: true,
                    ),
                    _buildTimelineStep(
                      stepNum: "3",
                      title: "Operations Center Review",
                      desc: "Awaiting final activation from the Fleet Manager Admin dashboard.",
                      isDone: false,
                      isLast: true,
                    ),
                    
                    const SizedBox(height: 20),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade50,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.grey.shade150),
                      ),
                      child: const Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('💡 ', style: TextStyle(fontSize: 14)),
                          Expanded(
                            child: Text(
                              'Demo Tip: Switch to the "Control Panel" tab below, head to the "Category Stocks & Onboarding" section, find this driver, and click "Verify Documents" to approve.',
                              style: TextStyle(fontSize: 10, color: Colors.black54, height: 1.3),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              )

            // If selected driver is Active/Approved
            else ...[
              // Active Driver Info Card
              Container(
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
                          radius: 24,
                          backgroundImage: NetworkImage(activeDriver.avatarUrl),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                activeDriver.name,
                                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.black),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${activeDriver.vehicle} • ${activeDriver.plateNumber}',
                                style: TextStyle(fontSize: 10, color: Colors.grey.shade500, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: activeDriver.status == "offline" ? Colors.grey.shade100 : Colors.green.shade50,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: activeDriver.status == "offline" ? Colors.grey.shade300 : Colors.green.shade200,
                            ),
                          ),
                          child: Text(
                            activeDriver.status == "offline" ? 'OFFLINE' : 'ONLINE IDLE',
                            style: TextStyle(
                              color: activeDriver.status == "offline" ? Colors.grey.shade600 : Colors.green.shade700,
                              fontSize: 9,
                              fontWeight: FontWeight.black,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Divider(height: 1),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.between,
                      children: [
                        const Text(
                          'Rider Duty Shift',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.black, color: Colors.black54),
                        ),
                        ElevatedButton.icon(
                          onPressed: () {
                            appState.toggleDriverOnline(activeDriver.id);
                          },
                          icon: Icon(
                            Icons.power_settings_new,
                            size: 14,
                            color: activeDriver.status != "offline" ? Colors.red : Colors.green,
                          ),
                          label: Text(
                            activeDriver.status != "offline" ? 'Go Offline' : 'Go Online',
                            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.black),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: Colors.black,
                            elevation: 0.5,
                            side: BorderSide(color: Colors.grey.shade300),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ],
                    )
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Normal Duty Dashboard Mockup
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      activeDriver.status == "offline" ? Icons.directions_bike : Icons.radar_outlined,
                      size: 48,
                      color: activeDriver.status == "offline" ? Colors.grey.shade300 : Colors.green.shade500,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      activeDriver.status == "offline" ? 'Rider Shift is Offline' : 'Scanning for Grocery Jobs...',
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.black),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      activeDriver.status == "offline"
                          ? 'Toggle your shift Online above to start receiving organic express orders in your queue.'
                          : 'You are priority routed to SOMA Organic Grocers. High-density jobs deliver in under 15 mins.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 10, color: Colors.grey.shade500, height: 1.4),
                    ),
                  ],
                ),
              ),
            ]
          ],
        ),
      ),
    );
  }

  // Multi-step Timeline Node Helper
  Widget _buildTimelineStep({
    required String stepNum,
    required String title,
    required String desc,
    required bool isDone,
    bool isLast = false,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 22,
              height: 22,
              decoration: BoxDecoration(
                color: isDone ? Colors.green.shade600 : Colors.orange.shade500,
                shape: BoxShape.circle,
              ),
              alignment: Alignment.center,
              child: isDone
                  ? const Icon(Icons.check, size: 12, color: Colors.white)
                  : Text(
                      stepNum,
                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 32,
                color: isDone ? Colors.green.shade600 : Colors.grey.shade300,
              ),
          ],
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.black,
                  color: isDone ? Colors.black87 : Colors.orange.shade800,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                desc,
                style: const TextStyle(fontSize: 9, color: Colors.grey),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ],
    );
  }

  // Onboarding registration form dialog
  void _showRegistrationDialog(BuildContext context, AppState appState) {
    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              title: const Text('Rider Registration Form', style: TextStyle(fontSize: 14, fontWeight: FontWeight.black)),
              content: Form(
                key: _formKey,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      TextFormField(
                        controller: _nameController,
                        decoration: const InputDecoration(labelText: 'Full Name', labelStyle: TextStyle(fontSize: 11)),
                        validator: (value) => value == null || value.isEmpty ? 'Enter name' : null,
                      ),
                      TextFormField(
                        controller: _phoneController,
                        decoration: const InputDecoration(labelText: 'Phone Number', labelStyle: TextStyle(fontSize: 11)),
                        validator: (value) => value == null || value.isEmpty ? 'Enter phone' : null,
                      ),
                      TextFormField(
                        controller: _plateController,
                        decoration: const InputDecoration(labelText: 'License Plate (Optional)', labelStyle: TextStyle(fontSize: 11)),
                      ),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        value: _selectedVehicle,
                        decoration: const InputDecoration(labelText: 'Vehicle Fleet Class', labelStyle: TextStyle(fontSize: 11)),
                        items: _vehicles.map((v) {
                          return DropdownMenuItem<String>(
                            value: v,
                            child: Text(v, style: const TextStyle(fontSize: 11)),
                          );
                        }).toList(),
                        onChanged: (val) {
                          setDialogState(() {
                            _selectedVehicle = val!;
                          });
                        },
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: () {
                    if (_formKey.currentState!.validate()) {
                      appState.registerDriver(
                        _nameController.text,
                        _phoneController.text,
                        _selectedVehicle,
                        _plateController.text,
                      );
                      _nameController.clear();
                      _phoneController.clear();
                      _plateController.clear();
                      Navigator.pop(context);

                      // Switch simulation identity to the newly registered driver
                      final newDriver = appState.drivers.last;
                      setState(() {
                        _selectedDriverId = newDriver.id;
                      });

                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Registered! Profile pending operational verification.')),
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE01460), foregroundColor: Colors.white),
                  child: const Text('Apply'),
                )
              ],
            );
          },
        );
      },
    );
  }
}
