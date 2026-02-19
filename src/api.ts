export function getSuppliers() {
    let suppliers: Record<string, any> = {};
    suppliers['SUP-1000'] = {
        id: 'SUP-1000',
        name: 'ERPMax Solutions',
        status: 'Active',
        category: 'ERP Software',
        country: 'USA',
        contact_name: 'Sarah Mitchell',
        contact_email: 'sarah.mitchell@erpmax.com',
        contact_phone: '+1-555-0142',
        risk_score: 2.1,
        created_date: '2024-03-15T00:00:00'
    };

    suppliers['SUP-1001'] = {
        id: 'SUP-1001',
        name: 'IntegraPro Systems',
        status: 'Active',
        category: 'ERP Software',
        country: 'USA',
        contact_name: 'Michael Chen',
        contact_email: 'm.chen@integrapro.com',
        contact_phone: '+1-555-0287',
        risk_score: 1.8,
        created_date: '2023-11-20T00:00:00'
    };

    suppliers['SUP-1002'] = {
        id: 'SUP-1002',
        name: 'CloudFirst ERP',
        status: 'Active',
        category: 'ERP Software',
        country: 'USA',
        contact_name: 'Jennifer Walsh',
        contact_email: 'j.walsh@cloudfirsterp.com',
        contact_phone: '+1-555-0393',
        risk_score: 3.5,
        created_date: '2025-01-10T00:00:00'
    };

    // ANOMALY: Duplicate supplier - same company registered twice with slight name variation
    suppliers['SUP-1003'] = {
        id: 'SUP-1003',
        name: 'ERP Max Solutions Inc', // Same as SUP-1000 but with slight name variation
        status: 'Active',
        category: 'ERP Software',
        country: 'USA',
        contact_name: 'Sarah Mitchell', // Same contact
        contact_email: 's.mitchell@erpmax.com', // Slightly different email
        contact_phone: '+1-555-0142', // Same phone
        risk_score: 2.3,
        created_date: '2025-06-01T00:00:00' // Created later - possible duplicate entry
    };

    // ANOMALY: Supplier with outdated/stale data
    suppliers['SUP-1004'] = {
        id: 'SUP-1004',
        name: 'Legacy Systems Corp',
        status: 'Active', // Still marked active but contract expired 2 years ago
        category: 'Legacy Software',
        country: 'USA',
        contact_name: 'Robert Johnson',
        contact_email: 'r.johnson@legacysystems.com',
        contact_phone: '+1-555-0199',
        risk_score: 7.5, // High risk score
        created_date: '2019-03-01T00:00:00',
        last_activity_date: '2023-12-15T00:00:00' // No activity for over 2 years
    };

    return suppliers;
}
