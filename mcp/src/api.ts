type Supplier = {
  id: string;
  name: string;
  status: string;
  category: string;
  country: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  risk_score: number;
  created_date: string;
  last_activity_date?: string;
};

type PurchaseOrder = {
  id: string;
  order_number: string;
  supplier_id: string;
  supplier_name: string;
  status: string;
  total_amount: number;
  currency: string;
  created_date: string;
  contract_reference?: string;
  anomaly_flag?: string;
};

type Requisition = {
  id: string;
  requisition_number: string;
  requester: string;
  status: string;
  total_amount: number;
  currency: string;
  created_date: string;
  approval_status: string;
  description: string;
};

type Invoice = {
  id: string;
  invoice_number: string;
  po_number: string;
  supplier_id: string;
  supplier_name: string;
  amount: number;
  currency: string;
  status: string;
  due_date: string;
  created_date: string;
  paid_date?: string;
  anomaly_flag?: string;
  rejection_reason?: string;
};

type Contract = {
  id: string;
  contract_number: string;
  title: string;
  supplier_id: string;
  supplier_name: string;
  start_date: string;
  end_date: string;
  value: number;
  currency: string;
  status: string;
  anomaly_flag?: string;
};

type RfpRequirement = {
  id: string;
  category: string;
  description: string;
  priority: string;
  weight: number;
};

type Rfp = {
  id: string;
  title: string;
  status: string;
  deadline: string;
  budget_max: number;
  currency: string;
  requirements: RfpRequirement[];
};

type Proposal = {
  id: string;
  rfp_id: string;
  supplier_id: string;
  supplier_name: string;
  status: string;
  submitted_date: string;
  pricing: {
    total: number;
    currency: string;
  };
  delivery_weeks: number;
  validity_days: number;
};

const suppliersDb: Record<string, Supplier> = {
  'SUP-1000': {
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
  },
  'SUP-1001': {
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
  },
  'SUP-1002': {
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
  },
  'SUP-1003': {
    id: 'SUP-1003',
    name: 'ERP Max Solutions Inc',
    status: 'Active',
    category: 'ERP Software',
    country: 'USA',
    contact_name: 'Sarah Mitchell',
    contact_email: 's.mitchell@erpmax.com',
    contact_phone: '+1-555-0142',
    risk_score: 2.3,
    created_date: '2025-06-01T00:00:00'
  },
  'SUP-1004': {
    id: 'SUP-1004',
    name: 'Legacy Systems Corp',
    status: 'Active',
    category: 'Legacy Software',
    country: 'USA',
    contact_name: 'Robert Johnson',
    contact_email: 'r.johnson@legacysystems.com',
    contact_phone: '+1-555-0199',
    risk_score: 7.5,
    created_date: '2019-03-01T00:00:00',
    last_activity_date: '2023-12-15T00:00:00'
  },
  'SUP-1005': {
    id: 'SUP-1005',
    name: 'Apex CRM Solutions',
    status: 'Active',
    category: 'CRM Software',
    country: 'USA',
    contact_name: 'David Harper',
    contact_email: 'david.harper@apexcrm.com',
    contact_phone: '+1-555-0301',
    risk_score: 2.4,
    created_date: '2023-05-10T00:00:00'
  },
  'SUP-1006': {
    id: 'SUP-1006',
    name: 'RelateIQ Technologies',
    status: 'Active',
    category: 'CRM Software',
    country: 'UK',
    contact_name: 'Emma Whitfield',
    contact_email: 'e.whitfield@relateiq.co.uk',
    contact_phone: '+44-20-7946-0301',
    risk_score: 3.1,
    created_date: '2022-11-15T00:00:00'
  },
  'SUP-1007': {
    id: 'SUP-1007',
    name: 'PipelineForce GmbH',
    status: 'Active',
    category: 'CRM Software',
    country: 'Germany',
    contact_name: 'Markus Bauer',
    contact_email: 'm.bauer@pipelineforce.de',
    contact_phone: '+49-30-5557-0122',
    risk_score: 4.8,
    created_date: '2024-02-20T00:00:00'
  },
  'SUP-1008': {
    id: 'SUP-1008',
    name: 'ClientHub Asia Pte Ltd',
    status: 'Under Review',
    category: 'CRM Software',
    country: 'Singapore',
    contact_name: 'Wei Lin Tan',
    contact_email: 'wl.tan@clienthub.sg',
    contact_phone: '+65-6335-0199',
    risk_score: 7.2,
    created_date: '2025-01-08T00:00:00'
  },
  'SUP-1009': {
    id: 'SUP-1009',
    name: 'ShieldNet Cyber',
    status: 'Active',
    category: 'Cybersecurity Software',
    country: 'Israel',
    contact_name: 'Yael Rosen',
    contact_email: 'y.rosen@shieldnetcyber.il',
    contact_phone: '+972-3-555-0188',
    risk_score: 1.9,
    created_date: '2022-08-01T00:00:00'
  },
  'SUP-1010': {
    id: 'SUP-1010',
    name: 'Fortiguard Systems Inc',
    status: 'Active',
    category: 'Cybersecurity Software',
    country: 'USA',
    contact_name: 'Kevin Morales',
    contact_email: 'k.morales@fortiguardsys.com',
    contact_phone: '+1-555-0410',
    risk_score: 2.7,
    created_date: '2023-04-22T00:00:00'
  },
  'SUP-1011': {
    id: 'SUP-1011',
    name: 'CyberVault UK Ltd',
    status: 'Inactive',
    category: 'Cybersecurity Software',
    country: 'UK',
    contact_name: 'Oliver Hastings',
    contact_email: 'o.hastings@cybervault.co.uk',
    contact_phone: '+44-20-7946-0455',
    risk_score: 8.1,
    created_date: '2022-02-14T00:00:00',
    last_activity_date: '2024-06-30T00:00:00'
  },
  'SUP-1012': {
    id: 'SUP-1012',
    name: 'NimbusScale Cloud',
    status: 'Active',
    category: 'Cloud Infrastructure',
    country: 'USA',
    contact_name: 'Rachel Torres',
    contact_email: 'r.torres@nimbusscale.com',
    contact_phone: '+1-555-0522',
    risk_score: 1.5,
    created_date: '2023-01-10T00:00:00'
  },
  'SUP-1013': {
    id: 'SUP-1013',
    name: 'CloudBridge Europe BV',
    status: 'Active',
    category: 'Cloud Infrastructure',
    country: 'Netherlands',
    contact_name: 'Pieter van Dijk',
    contact_email: 'p.vandijk@cloudbridge.nl',
    contact_phone: '+31-20-555-0133',
    risk_score: 3.8,
    created_date: '2024-06-15T00:00:00'
  },
  'SUP-1014': {
    id: 'SUP-1014',
    name: 'SkyTier Infrastructure',
    status: 'Active',
    category: 'Cloud Infrastructure',
    country: 'Canada',
    contact_name: 'Natalie Fournier',
    contact_email: 'n.fournier@skytier.ca',
    contact_phone: '+1-416-555-0277',
    risk_score: 2.2,
    created_date: '2022-09-30T00:00:00'
  },
  'SUP-1015': {
    id: 'SUP-1015',
    name: 'AsiaPacific Cloud Corp',
    status: 'Under Review',
    category: 'Cloud Infrastructure',
    country: 'Japan',
    contact_name: 'Takeshi Yamamoto',
    contact_email: 't.yamamoto@apcloud.jp',
    contact_phone: '+81-3-5555-0388',
    risk_score: 7.8,
    created_date: '2025-03-01T00:00:00'
  },
  'SUP-1016': {
    id: 'SUP-1016',
    name: 'InsightWave Analytics',
    status: 'Active',
    category: 'Data Analytics & BI',
    country: 'USA',
    contact_name: 'Christine Park',
    contact_email: 'c.park@insightwave.com',
    contact_phone: '+1-555-0633',
    risk_score: 2.0,
    created_date: '2023-07-18T00:00:00'
  },
  'SUP-1017': {
    id: 'SUP-1017',
    name: 'DataLens France SAS',
    status: 'Active',
    category: 'Data Analytics & BI',
    country: 'France',
    contact_name: 'Antoine Dubois',
    contact_email: 'a.dubois@datalens.fr',
    contact_phone: '+33-1-5555-0244',
    risk_score: 4.3,
    created_date: '2024-01-05T00:00:00'
  },
  'SUP-1018': {
    id: 'SUP-1018',
    name: 'Predilytics India Pvt Ltd',
    status: 'Active',
    category: 'Data Analytics & BI',
    country: 'India',
    contact_name: 'Arun Mehta',
    contact_email: 'a.mehta@predilytics.in',
    contact_phone: '+91-80-5555-0177',
    risk_score: 5.6,
    created_date: '2022-12-01T00:00:00'
  },
  'SUP-1019': {
    id: 'SUP-1019',
    name: 'ServiceGrid Technologies',
    status: 'Active',
    category: 'ITSM / IT Service Management',
    country: 'USA',
    contact_name: 'Brian Caldwell',
    contact_email: 'b.caldwell@servicegrid.com',
    contact_phone: '+1-555-0744',
    risk_score: 1.7,
    created_date: '2023-03-25T00:00:00'
  },
  'SUP-1020': {
    id: 'SUP-1020',
    name: 'HelixITSM AB',
    status: 'Active',
    category: 'ITSM / IT Service Management',
    country: 'Sweden',
    contact_name: 'Astrid Lindqvist',
    contact_email: 'a.lindqvist@helixitsm.se',
    contact_phone: '+46-8-555-0311',
    risk_score: 3.2,
    created_date: '2024-05-12T00:00:00'
  },
  'SUP-1021': {
    id: 'SUP-1021',
    name: 'ResolveDesk Ltd',
    status: 'Active',
    category: 'ITSM / IT Service Management',
    country: 'Australia',
    contact_name: "James O'Brien",
    contact_email: 'j.obrien@resolvedesk.com.au',
    contact_phone: '+61-2-5555-0199',
    risk_score: 4.1,
    created_date: '2022-07-20T00:00:00'
  },
  'SUP-1022': {
    id: 'SUP-1022',
    name: 'PeopleSync HR',
    status: 'Active',
    category: 'HR & Payroll Software',
    country: 'USA',
    contact_name: 'Amanda Brooks',
    contact_email: 'a.brooks@peoplesync.com',
    contact_phone: '+1-555-0855',
    risk_score: 2.8,
    created_date: '2023-09-14T00:00:00'
  },
  'SUP-1023': {
    id: 'SUP-1023',
    name: 'TalentForge Solutions',
    status: 'Active',
    category: 'HR & Payroll Software',
    country: 'Canada',
    contact_name: 'Sophie Tremblay',
    contact_email: 's.tremblay@talentforge.ca',
    contact_phone: '+1-514-555-0266',
    risk_score: 3.5,
    created_date: '2024-03-28T00:00:00'
  },
  'SUP-1024': {
    id: 'SUP-1024',
    name: 'PayrollExact India',
    status: 'Under Review',
    category: 'HR & Payroll Software',
    country: 'India',
    contact_name: 'Priya Sharma',
    contact_email: 'p.sharma@payrollexact.in',
    contact_phone: '+91-11-5555-0322',
    risk_score: 7.5,
    created_date: '2025-02-10T00:00:00'
  },
  'SUP-1025': {
    id: 'SUP-1025',
    name: 'ChainLink Logistics Tech',
    status: 'Active',
    category: 'Supply Chain Management',
    country: 'USA',
    contact_name: 'Marcus Reed',
    contact_email: 'm.reed@chainlinklt.com',
    contact_phone: '+1-555-0966',
    risk_score: 2.1,
    created_date: '2022-06-08T00:00:00'
  },
  'SUP-1026': {
    id: 'SUP-1026',
    name: 'TraceFlow GmbH',
    status: 'Active',
    category: 'Supply Chain Management',
    country: 'Germany',
    contact_name: 'Katharina Wolff',
    contact_email: 'k.wolff@traceflow.de',
    contact_phone: '+49-89-5557-0233',
    risk_score: 3.9,
    created_date: '2023-11-22T00:00:00'
  },
  'SUP-1027': {
    id: 'SUP-1027',
    name: 'LogiSmart Japan KK',
    status: 'Active',
    category: 'Supply Chain Management',
    country: 'Japan',
    contact_name: 'Hiroshi Tanaka',
    contact_email: 'h.tanaka@logismart.jp',
    contact_phone: '+81-6-5555-0144',
    risk_score: 5.2,
    created_date: '2024-08-05T00:00:00'
  },
  'SUP-1028': {
    id: 'SUP-1028',
    name: 'DocuVault Systems',
    status: 'Active',
    category: 'Document Management / ECM',
    country: 'USA',
    contact_name: 'Laura Stevens',
    contact_email: 'l.stevens@docuvault.com',
    contact_phone: '+1-555-1077',
    risk_score: 1.6,
    created_date: '2023-02-17T00:00:00'
  },
  'SUP-1029': {
    id: 'SUP-1029',
    name: 'ArchiveOne UK Ltd',
    status: 'Active',
    category: 'Document Management / ECM',
    country: 'UK',
    contact_name: 'Thomas Grant',
    contact_email: 't.grant@archiveone.co.uk',
    contact_phone: '+44-20-7946-0566',
    risk_score: 4.5,
    created_date: '2022-10-30T00:00:00'
  },
  'SUP-1030': {
    id: 'SUP-1030',
    name: 'ContentFlow BV',
    status: 'Inactive',
    category: 'Document Management / ECM',
    country: 'Netherlands',
    contact_name: 'Jan de Vries',
    contact_email: 'j.devries@contentflow.nl',
    contact_phone: '+31-20-555-0244',
    risk_score: 8.7,
    created_date: '2022-04-15T00:00:00',
    last_activity_date: '2024-09-01T00:00:00'
  },
  'SUP-1031': {
    id: 'SUP-1031',
    name: 'TeamSync Pro',
    status: 'Active',
    category: 'Collaboration & Communication',
    country: 'USA',
    contact_name: 'Jessica Murray',
    contact_email: 'j.murray@teamsyncpro.com',
    contact_phone: '+1-555-1188',
    risk_score: 1.3,
    created_date: '2023-06-20T00:00:00'
  },
  'SUP-1032': {
    id: 'SUP-1032',
    name: 'CollabWorks France SAS',
    status: 'Active',
    category: 'Collaboration & Communication',
    country: 'France',
    contact_name: 'Claire Martin',
    contact_email: 'c.martin@collabworks.fr',
    contact_phone: '+33-1-5555-0355',
    risk_score: 3.6,
    created_date: '2024-04-10T00:00:00'
  },
  'SUP-1033': {
    id: 'SUP-1033',
    name: 'UnifiedComm Technologies',
    status: 'Active',
    category: 'Collaboration & Communication',
    country: 'India',
    contact_name: 'Rajesh Kapoor',
    contact_email: 'r.kapoor@unifiedcomm.in',
    contact_phone: '+91-22-5555-0488',
    risk_score: 4.9,
    created_date: '2022-08-25T00:00:00'
  },
  'SUP-1034': {
    id: 'SUP-1034',
    name: 'ChatGrid Singapore Pte',
    status: 'Active',
    category: 'Collaboration & Communication',
    country: 'Singapore',
    contact_name: 'Michelle Lim',
    contact_email: 'm.lim@chatgrid.sg',
    contact_phone: '+65-6335-0288',
    risk_score: 2.5,
    created_date: '2025-04-15T00:00:00'
  },
  'SUP-1035': {
    id: 'SUP-1035',
    name: 'DeployMaster Inc',
    status: 'Active',
    category: 'DevOps & CI/CD Tools',
    country: 'USA',
    contact_name: 'Tyler Robinson',
    contact_email: 't.robinson@deploymaster.com',
    contact_phone: '+1-555-1299',
    risk_score: 1.8,
    created_date: '2023-08-12T00:00:00'
  },
  'SUP-1036': {
    id: 'SUP-1036',
    name: 'PipeOps AB',
    status: 'Active',
    category: 'DevOps & CI/CD Tools',
    country: 'Sweden',
    contact_name: 'Erik Johansson',
    contact_email: 'e.johansson@pipeops.se',
    contact_phone: '+46-8-555-0422',
    risk_score: 3.4,
    created_date: '2024-07-01T00:00:00'
  },
  'SUP-1037': {
    id: 'SUP-1037',
    name: 'BuildStream Israel Ltd',
    status: 'Active',
    category: 'DevOps & CI/CD Tools',
    country: 'Israel',
    contact_name: 'Noam Levy',
    contact_email: 'n.levy@buildstream.il',
    contact_phone: '+972-3-555-0299',
    risk_score: 5.0,
    created_date: '2022-05-18T00:00:00'
  },
  'SUP-1038': {
    id: 'SUP-1038',
    name: 'NeuralPath AI',
    status: 'Active',
    category: 'AI & Machine Learning Platforms',
    country: 'USA',
    contact_name: 'Samantha Lee',
    contact_email: 's.lee@neuralpath.ai',
    contact_phone: '+1-555-1410',
    risk_score: 2.3,
    created_date: '2024-01-15T00:00:00'
  },
  'SUP-1039': {
    id: 'SUP-1039',
    name: 'DeepSense Technologies',
    status: 'Active',
    category: 'AI & Machine Learning Platforms',
    country: 'UK',
    contact_name: 'George Pemberton',
    contact_email: 'g.pemberton@deepsense.co.uk',
    contact_phone: '+44-20-7946-0677',
    risk_score: 3.0,
    created_date: '2023-10-08T00:00:00'
  },
  'SUP-1040': {
    id: 'SUP-1040',
    name: 'CogniWare Japan KK',
    status: 'Active',
    category: 'AI & Machine Learning Platforms',
    country: 'Japan',
    contact_name: 'Yuki Nakamura',
    contact_email: 'y.nakamura@cogniware.jp',
    contact_phone: '+81-3-5555-0499',
    risk_score: 4.7,
    created_date: '2024-09-20T00:00:00'
  },
  'SUP-1041': {
    id: 'SUP-1041',
    name: 'MLForge India Pvt Ltd',
    status: 'Under Review',
    category: 'AI & Machine Learning Platforms',
    country: 'India',
    contact_name: 'Vikram Patel',
    contact_email: 'v.patel@mlforge.in',
    contact_phone: '+91-80-5555-0611',
    risk_score: 8.9,
    created_date: '2025-05-01T00:00:00'
  },
  'SUP-1042': {
    id: 'SUP-1042',
    name: 'FinLedger Systems',
    status: 'Active',
    category: 'Financial Management Software',
    country: 'USA',
    contact_name: 'Patricia Coleman',
    contact_email: 'p.coleman@finledger.com',
    contact_phone: '+1-555-1521',
    risk_score: 1.4,
    created_date: '2022-03-22T00:00:00'
  },
  'SUP-1043': {
    id: 'SUP-1043',
    name: 'EuroFinTech GmbH',
    status: 'Active',
    category: 'Financial Management Software',
    country: 'Germany',
    contact_name: 'Stefan Mueller',
    contact_email: 's.mueller@eurofintech.de',
    contact_phone: '+49-69-5557-0344',
    risk_score: 3.7,
    created_date: '2023-12-10T00:00:00'
  },
  'SUP-1044': {
    id: 'SUP-1044',
    name: 'LedgerWise Canada Inc',
    status: 'Active',
    category: 'Financial Management Software',
    country: 'Canada',
    contact_name: 'Marie Gagnon',
    contact_email: 'm.gagnon@ledgerwise.ca',
    contact_phone: '+1-613-555-0355',
    risk_score: 5.4,
    created_date: '2024-11-05T00:00:00'
  },
  'SUP-1045': {
    id: 'SUP-1045',
    name: 'ProjectBeam Inc',
    status: 'Active',
    category: 'Project Management Software',
    country: 'USA',
    contact_name: 'Andrew Foster',
    contact_email: 'a.foster@projectbeam.com',
    contact_phone: '+1-555-1632',
    risk_score: 2.6,
    created_date: '2023-04-05T00:00:00'
  },
  'SUP-1046': {
    id: 'SUP-1046',
    name: 'AgilePath Australia Pty',
    status: 'Active',
    category: 'Project Management Software',
    country: 'Australia',
    contact_name: 'Sarah Bennett',
    contact_email: 's.bennett@agilepath.com.au',
    contact_phone: '+61-3-5555-0344',
    risk_score: 3.3,
    created_date: '2024-02-18T00:00:00'
  },
  'SUP-1047': {
    id: 'SUP-1047',
    name: 'TaskWave France SAS',
    status: 'Inactive',
    category: 'Project Management Software',
    country: 'France',
    contact_name: 'Julien Moreau',
    contact_email: 'j.moreau@taskwave.fr',
    contact_phone: '+33-1-5555-0466',
    risk_score: 9.1,
    created_date: '2022-01-20T00:00:00',
    last_activity_date: '2024-03-15T00:00:00'
  },
  'SUP-1048': {
    id: 'SUP-1048',
    name: 'TrustGate Security',
    status: 'Active',
    category: 'Identity & Access Management',
    country: 'USA',
    contact_name: 'Nicole Chang',
    contact_email: 'n.chang@trustgate.com',
    contact_phone: '+1-555-1743',
    risk_score: 1.2,
    created_date: '2023-07-30T00:00:00'
  },
  'SUP-1049': {
    id: 'SUP-1049',
    name: 'SecureID Netherlands BV',
    status: 'Active',
    category: 'Identity & Access Management',
    country: 'Netherlands',
    contact_name: 'Daan Bakker',
    contact_email: 'd.bakker@secureid.nl',
    contact_phone: '+31-20-555-0355',
    risk_score: 4.0,
    created_date: '2024-06-22T00:00:00'
  },
  'SUP-1050': {
    id: 'SUP-1050',
    name: 'AuthShield Israel Ltd',
    status: 'Active',
    category: 'Identity & Access Management',
    country: 'Israel',
    contact_name: 'Avi Cohen',
    contact_email: 'a.cohen@authshield.il',
    contact_phone: '+972-3-555-0411',
    risk_score: 2.9,
    created_date: '2022-11-08T00:00:00'
  },
  'SUP-1051': {
    id: 'SUP-1051',
    name: 'VaultRecover Inc',
    status: 'Active',
    category: 'Backup & Disaster Recovery',
    country: 'USA',
    contact_name: 'Daniel Wright',
    contact_email: 'd.wright@vaultrecover.com',
    contact_phone: '+1-555-1854',
    risk_score: 1.9,
    created_date: '2023-05-25T00:00:00'
  },
  'SUP-1052': {
    id: 'SUP-1052',
    name: 'DataSafe UK Ltd',
    status: 'Active',
    category: 'Backup & Disaster Recovery',
    country: 'UK',
    contact_name: 'Charlotte Evans',
    contact_email: 'c.evans@datasafe.co.uk',
    contact_phone: '+44-20-7946-0788',
    risk_score: 3.2,
    created_date: '2024-08-12T00:00:00'
  },
  'SUP-1053': {
    id: 'SUP-1053',
    name: 'BackupPro Singapore Pte',
    status: 'Under Review',
    category: 'Backup & Disaster Recovery',
    country: 'Singapore',
    contact_name: 'Kenneth Ong',
    contact_email: 'k.ong@backuppro.sg',
    contact_phone: '+65-6335-0377',
    risk_score: 7.0,
    created_date: '2025-06-01T00:00:00'
  },
  'SUP-1054': {
    id: 'SUP-1054',
    name: 'RecoverIT Australia Pty',
    status: 'Active',
    category: 'Backup & Disaster Recovery',
    country: 'Australia',
    contact_name: 'Liam Mitchell',
    contact_email: 'l.mitchell@recoverit.com.au',
    contact_phone: '+61-2-5555-0455',
    risk_score: 5.8,
    created_date: '2022-07-14T00:00:00'
  }
};

const purchaseOrdersDb: Record<string, PurchaseOrder> = {
  'PO-2024001': {
    id: 'PO-2024001',
    order_number: 'PO-2024001',
    supplier_id: 'SUP-1000',
    supplier_name: 'ERPMax Solutions',
    status: 'Closed',
    total_amount: 125000,
    currency: 'USD',
    created_date: '2024-06-15T00:00:00'
  },
  'PO-2025002': {
    id: 'PO-2025002',
    order_number: 'PO-2025002',
    supplier_id: 'SUP-1000',
    supplier_name: 'ERPMax Solutions',
    status: 'Received',
    total_amount: 35000,
    currency: 'USD',
    created_date: '2025-08-05T00:00:00'
  },
  'PO-2025003': {
    id: 'PO-2025003',
    order_number: 'PO-2025003',
    supplier_id: 'SUP-1002',
    supplier_name: 'CloudFirst ERP',
    status: 'Closed',
    total_amount: 15000,
    currency: 'USD',
    created_date: '2025-03-15T00:00:00'
  },
  'PO-2025006': {
    id: 'PO-2025006',
    order_number: 'PO-2025006',
    supplier_id: 'SUP-1002',
    supplier_name: 'CloudFirst ERP',
    status: 'Pending Approval',
    total_amount: 75000,
    currency: 'USD',
    created_date: '2025-12-01T00:00:00',
    contract_reference: 'CON-5025001',
    anomaly_flag: 'PO amount ($75,000) exceeds contract value ($25,000)'
  },
  'PO-2025007': {
    id: 'PO-2025007',
    order_number: 'PO-2025007',
    supplier_id: 'SUP-1005',
    supplier_name: 'Apex CRM Solutions',
    status: 'Approved',
    total_amount: 85000,
    currency: 'USD',
    created_date: '2025-03-10T00:00:00',
    contract_reference: 'CON-5025002'
  },
  'PO-2025008': {
    id: 'PO-2025008',
    order_number: 'PO-2025008',
    supplier_id: 'SUP-1006',
    supplier_name: 'RelateIQ Technologies',
    status: 'Received',
    total_amount: 62000,
    currency: 'GBP',
    created_date: '2025-04-15T00:00:00',
    contract_reference: 'CON-5025003'
  },
  'PO-2025009': {
    id: 'PO-2025009',
    order_number: 'PO-2025009',
    supplier_id: 'SUP-1009',
    supplier_name: 'ShieldNet Cyber',
    status: 'Approved',
    total_amount: 175000,
    currency: 'USD',
    created_date: '2025-02-20T00:00:00',
    contract_reference: 'CON-5025004'
  },
  'PO-2025010': {
    id: 'PO-2025010',
    order_number: 'PO-2025010',
    supplier_id: 'SUP-1010',
    supplier_name: 'Fortiguard Systems Inc',
    status: 'Closed',
    total_amount: 48000,
    currency: 'USD',
    created_date: '2025-01-08T00:00:00'
  },
  'PO-2025011': {
    id: 'PO-2025011',
    order_number: 'PO-2025011',
    supplier_id: 'SUP-1012',
    supplier_name: 'NimbusScale Cloud',
    status: 'Approved',
    total_amount: 320000,
    currency: 'USD',
    created_date: '2025-05-22T00:00:00',
    contract_reference: 'CON-5025005'
  },
  'PO-2025012': {
    id: 'PO-2025012',
    order_number: 'PO-2025012',
    supplier_id: 'SUP-1013',
    supplier_name: 'CloudBridge Europe BV',
    status: 'Pending Approval',
    total_amount: 145000,
    currency: 'EUR',
    created_date: '2025-06-01T00:00:00',
    contract_reference: 'CON-5025006'
  },
  'PO-2025013': {
    id: 'PO-2025013',
    order_number: 'PO-2025013',
    supplier_id: 'SUP-1014',
    supplier_name: 'SkyTier Infrastructure',
    status: 'Approved',
    total_amount: 210000,
    currency: 'CAD',
    created_date: '2025-03-28T00:00:00',
    contract_reference: 'CON-5025007'
  },
  'PO-2025014': {
    id: 'PO-2025014',
    order_number: 'PO-2025014',
    supplier_id: 'SUP-1016',
    supplier_name: 'InsightWave Analytics',
    status: 'Received',
    total_amount: 95000,
    currency: 'USD',
    created_date: '2025-04-05T00:00:00',
    contract_reference: 'CON-5025008'
  },
  'PO-2025015': {
    id: 'PO-2025015',
    order_number: 'PO-2025015',
    supplier_id: 'SUP-1017',
    supplier_name: 'DataLens France SAS',
    status: 'Approved',
    total_amount: 78000,
    currency: 'EUR',
    created_date: '2025-07-12T00:00:00'
  },
  'PO-2025016': {
    id: 'PO-2025016',
    order_number: 'PO-2025016',
    supplier_id: 'SUP-1019',
    supplier_name: 'ServiceGrid Technologies',
    status: 'Closed',
    total_amount: 115000,
    currency: 'USD',
    created_date: '2025-01-30T00:00:00',
    contract_reference: 'CON-5025009'
  },
  'PO-2025017': {
    id: 'PO-2025017',
    order_number: 'PO-2025017',
    supplier_id: 'SUP-1020',
    supplier_name: 'HelixITSM AB',
    status: 'Approved',
    total_amount: 88000,
    currency: 'EUR',
    created_date: '2025-05-18T00:00:00'
  },
  'PO-2025018': {
    id: 'PO-2025018',
    order_number: 'PO-2025018',
    supplier_id: 'SUP-1022',
    supplier_name: 'PeopleSync HR',
    status: 'Pending Approval',
    total_amount: 135000,
    currency: 'USD',
    created_date: '2025-08-01T00:00:00',
    contract_reference: 'CON-5025010'
  },
  'PO-2025019': {
    id: 'PO-2025019',
    order_number: 'PO-2025019',
    supplier_id: 'SUP-1023',
    supplier_name: 'TalentForge Solutions',
    status: 'Draft',
    total_amount: 42000,
    currency: 'CAD',
    created_date: '2025-09-10T00:00:00'
  },
  'PO-2025020': {
    id: 'PO-2025020',
    order_number: 'PO-2025020',
    supplier_id: 'SUP-1025',
    supplier_name: 'ChainLink Logistics Tech',
    status: 'Approved',
    total_amount: 260000,
    currency: 'USD',
    created_date: '2025-02-14T00:00:00',
    contract_reference: 'CON-5025011'
  },
  'PO-2025021': {
    id: 'PO-2025021',
    order_number: 'PO-2025021',
    supplier_id: 'SUP-1026',
    supplier_name: 'TraceFlow GmbH',
    status: 'Received',
    total_amount: 185000,
    currency: 'EUR',
    created_date: '2025-04-20T00:00:00',
    contract_reference: 'CON-5025012'
  },
  'PO-2025022': {
    id: 'PO-2025022',
    order_number: 'PO-2025022',
    supplier_id: 'SUP-1028',
    supplier_name: 'DocuVault Systems',
    status: 'Approved',
    total_amount: 56000,
    currency: 'USD',
    created_date: '2025-06-15T00:00:00'
  },
  'PO-2025023': {
    id: 'PO-2025023',
    order_number: 'PO-2025023',
    supplier_id: 'SUP-1031',
    supplier_name: 'TeamSync Pro',
    status: 'Closed',
    total_amount: 72000,
    currency: 'USD',
    created_date: '2025-01-22T00:00:00',
    contract_reference: 'CON-5025013'
  },
  'PO-2025024': {
    id: 'PO-2025024',
    order_number: 'PO-2025024',
    supplier_id: 'SUP-1032',
    supplier_name: 'CollabWorks France SAS',
    status: 'Approved',
    total_amount: 98000,
    currency: 'EUR',
    created_date: '2025-05-30T00:00:00'
  },
  'PO-2025025': {
    id: 'PO-2025025',
    order_number: 'PO-2025025',
    supplier_id: 'SUP-1035',
    supplier_name: 'DeployMaster Inc',
    status: 'Received',
    total_amount: 165000,
    currency: 'USD',
    created_date: '2025-03-15T00:00:00',
    contract_reference: 'CON-5025014'
  },
  'PO-2025026': {
    id: 'PO-2025026',
    order_number: 'PO-2025026',
    supplier_id: 'SUP-1036',
    supplier_name: 'PipeOps AB',
    status: 'Pending Approval',
    total_amount: 124000,
    currency: 'EUR',
    created_date: '2025-07-08T00:00:00'
  },
  'PO-2025027': {
    id: 'PO-2025027',
    order_number: 'PO-2025027',
    supplier_id: 'SUP-1038',
    supplier_name: 'NeuralPath AI',
    status: 'Approved',
    total_amount: 480000,
    currency: 'USD',
    created_date: '2025-04-01T00:00:00',
    contract_reference: 'CON-5025015',
    anomaly_flag: 'PO amount ($480,000) exceeds contract value ($400,000)'
  },
  'PO-2025028': {
    id: 'PO-2025028',
    order_number: 'PO-2025028',
    supplier_id: 'SUP-1039',
    supplier_name: 'DeepSense Technologies',
    status: 'Approved',
    total_amount: 225000,
    currency: 'GBP',
    created_date: '2025-06-20T00:00:00',
    contract_reference: 'CON-5025016'
  },
  'PO-2025029': {
    id: 'PO-2025029',
    order_number: 'PO-2025029',
    supplier_id: 'SUP-1042',
    supplier_name: 'FinLedger Systems',
    status: 'Closed',
    total_amount: 155000,
    currency: 'USD',
    created_date: '2025-02-05T00:00:00',
    contract_reference: 'CON-5025017'
  },
  'PO-2025030': {
    id: 'PO-2025030',
    order_number: 'PO-2025030',
    supplier_id: 'SUP-1043',
    supplier_name: 'EuroFinTech GmbH',
    status: 'Approved',
    total_amount: 198000,
    currency: 'EUR',
    created_date: '2025-08-15T00:00:00'
  },
  'PO-2025031': {
    id: 'PO-2025031',
    order_number: 'PO-2025031',
    supplier_id: 'SUP-1045',
    supplier_name: 'ProjectBeam Inc',
    status: 'Received',
    total_amount: 67000,
    currency: 'USD',
    created_date: '2025-03-22T00:00:00'
  },
  'PO-2025032': {
    id: 'PO-2025032',
    order_number: 'PO-2025032',
    supplier_id: 'SUP-1048',
    supplier_name: 'TrustGate Security',
    status: 'Approved',
    total_amount: 142000,
    currency: 'USD',
    created_date: '2025-05-10T00:00:00',
    contract_reference: 'CON-5025018'
  },
  'PO-2025033': {
    id: 'PO-2025033',
    order_number: 'PO-2025033',
    supplier_id: 'SUP-1050',
    supplier_name: 'AuthShield Israel Ltd',
    status: 'Draft',
    total_amount: 89000,
    currency: 'USD',
    created_date: '2025-09-25T00:00:00'
  },
  'PO-2025034': {
    id: 'PO-2025034',
    order_number: 'PO-2025034',
    supplier_id: 'SUP-1051',
    supplier_name: 'VaultRecover Inc',
    status: 'Approved',
    total_amount: 310000,
    currency: 'USD',
    created_date: '2025-04-12T00:00:00',
    contract_reference: 'CON-5025019'
  },
  'PO-2025035': {
    id: 'PO-2025035',
    order_number: 'PO-2025035',
    supplier_id: 'SUP-1052',
    supplier_name: 'DataSafe UK Ltd',
    status: 'Pending Approval',
    total_amount: 178000,
    currency: 'GBP',
    created_date: '2025-07-30T00:00:00',
    contract_reference: 'CON-5025020',
    anomaly_flag: 'Duplicate PO suspected — similar order PO-2025034 exists'
  },
  'PO-2025036': {
    id: 'PO-2025036',
    order_number: 'PO-2025036',
    supplier_id: 'SUP-1015',
    supplier_name: 'AsiaPacific Cloud Corp',
    status: 'Approved',
    total_amount: 420000,
    currency: 'USD',
    created_date: '2025-06-05T00:00:00',
    contract_reference: 'CON-5025021',
    anomaly_flag: 'Late delivery — expected 2025-08-01, not yet received'
  }
};

const requisitionsDb: Record<string, Requisition> = {
  'REQ-3024001': {
    id: 'REQ-3024001',
    requisition_number: 'REQ-3024001',
    requester: 'John Smith',
    status: 'Approved',
    total_amount: 390000,
    currency: 'USD',
    created_date: '2026-01-20T00:00:00',
    approval_status: 'Approved',
    description: 'Enterprise ERP System - ERPMax Solutions proposal'
  },
  'REQ-3024002': {
    id: 'REQ-3024002',
    requisition_number: 'REQ-3024002',
    requester: 'Jane Doe',
    status: 'Pending Approval',
    total_amount: 450000,
    currency: 'USD',
    created_date: '2026-01-22T00:00:00',
    approval_status: 'Pending',
    description: 'Enterprise ERP System - IntegraPro Systems proposal'
  }
};

const invoicesDb: Record<string, Invoice> = {
  'INV-4025002': {
    id: 'INV-4025002',
    invoice_number: 'INV-4025002',
    po_number: 'PO-2025002',
    supplier_id: 'SUP-1000',
    supplier_name: 'ERPMax Solutions',
    amount: 35000,
    currency: 'USD',
    status: 'Under Review',
    due_date: '2025-09-05T00:00:00',
    created_date: '2025-08-10T00:00:00'
  },
  'INV-4025003': {
    id: 'INV-4025003',
    invoice_number: 'INV-4025003',
    po_number: 'PO-2025003',
    supplier_id: 'SUP-1002',
    supplier_name: 'CloudFirst ERP',
    amount: 15000,
    currency: 'USD',
    status: 'Paid',
    due_date: '2025-04-15T00:00:00',
    created_date: '2025-03-20T00:00:00',
    paid_date: '2025-04-25T00:00:00'
  },
  'INV-4025006': {
    id: 'INV-4025006',
    invoice_number: 'INV-4025006',
    po_number: 'PO-2025002',
    supplier_id: 'SUP-1000',
    supplier_name: 'ERPMax Solutions',
    amount: 42000,
    currency: 'USD',
    status: 'Rejected',
    due_date: '2025-09-15T00:00:00',
    created_date: '2025-08-20T00:00:00',
    anomaly_flag: 'Invoice amount ($42,000) exceeds PO amount ($35,000) by $7,000',
    rejection_reason: 'Amount mismatch - requires PO amendment or new PO'
  },
  'INV-4025007': {
    id: 'INV-4025007',
    invoice_number: 'INV-4025007',
    po_number: 'PO-2025007',
    supplier_id: 'SUP-1005',
    supplier_name: 'Apex CRM Solutions',
    amount: 85000,
    currency: 'USD',
    status: 'Paid',
    due_date: '2025-04-10T00:00:00',
    created_date: '2025-03-15T00:00:00',
    paid_date: '2025-04-08T00:00:00'
  },
  'INV-4025008': {
    id: 'INV-4025008',
    invoice_number: 'INV-4025008',
    po_number: 'PO-2025008',
    supplier_id: 'SUP-1006',
    supplier_name: 'RelateIQ Technologies',
    amount: 62000,
    currency: 'GBP',
    status: 'Paid',
    due_date: '2025-05-15T00:00:00',
    created_date: '2025-04-20T00:00:00',
    paid_date: '2025-05-12T00:00:00'
  },
  'INV-4025009': {
    id: 'INV-4025009',
    invoice_number: 'INV-4025009',
    po_number: 'PO-2025009',
    supplier_id: 'SUP-1009',
    supplier_name: 'ShieldNet Cyber',
    amount: 175000,
    currency: 'USD',
    status: 'Approved',
    due_date: '2025-03-20T00:00:00',
    created_date: '2025-02-25T00:00:00'
  },
  'INV-4025010': {
    id: 'INV-4025010',
    invoice_number: 'INV-4025010',
    po_number: 'PO-2025010',
    supplier_id: 'SUP-1010',
    supplier_name: 'Fortiguard Systems Inc',
    amount: 48000,
    currency: 'USD',
    status: 'Paid',
    due_date: '2025-02-08T00:00:00',
    created_date: '2025-01-12T00:00:00',
    paid_date: '2025-02-05T00:00:00'
  },
  'INV-4025011': {
    id: 'INV-4025011',
    invoice_number: 'INV-4025011',
    po_number: 'PO-2025011',
    supplier_id: 'SUP-1012',
    supplier_name: 'NimbusScale Cloud',
    amount: 320000,
    currency: 'USD',
    status: 'Under Review',
    due_date: '2025-06-22T00:00:00',
    created_date: '2025-05-28T00:00:00'
  },
  'INV-4025012': {
    id: 'INV-4025012',
    invoice_number: 'INV-4025012',
    po_number: 'PO-2025013',
    supplier_id: 'SUP-1014',
    supplier_name: 'SkyTier Infrastructure',
    amount: 210000,
    currency: 'CAD',
    status: 'Paid',
    due_date: '2025-04-28T00:00:00',
    created_date: '2025-04-01T00:00:00',
    paid_date: '2025-04-25T00:00:00'
  },
  'INV-4025013': {
    id: 'INV-4025013',
    invoice_number: 'INV-4025013',
    po_number: 'PO-2025014',
    supplier_id: 'SUP-1016',
    supplier_name: 'InsightWave Analytics',
    amount: 95000,
    currency: 'USD',
    status: 'Paid',
    due_date: '2025-05-05T00:00:00',
    created_date: '2025-04-10T00:00:00',
    paid_date: '2025-05-02T00:00:00'
  },
  'INV-4025014': {
    id: 'INV-4025014',
    invoice_number: 'INV-4025014',
    po_number: 'PO-2025016',
    supplier_id: 'SUP-1019',
    supplier_name: 'ServiceGrid Technologies',
    amount: 115000,
    currency: 'USD',
    status: 'Paid',
    due_date: '2025-02-28T00:00:00',
    created_date: '2025-02-03T00:00:00',
    paid_date: '2025-02-26T00:00:00'
  },
  'INV-4025015': {
    id: 'INV-4025015',
    invoice_number: 'INV-4025015',
    po_number: 'PO-2025020',
    supplier_id: 'SUP-1025',
    supplier_name: 'ChainLink Logistics Tech',
    amount: 260000,
    currency: 'USD',
    status: 'Overdue',
    due_date: '2025-03-14T00:00:00',
    created_date: '2025-02-18T00:00:00'
  },
  'INV-4025016': {
    id: 'INV-4025016',
    invoice_number: 'INV-4025016',
    po_number: 'PO-2025021',
    supplier_id: 'SUP-1026',
    supplier_name: 'TraceFlow GmbH',
    amount: 185000,
    currency: 'EUR',
    status: 'Paid',
    due_date: '2025-05-20T00:00:00',
    created_date: '2025-04-25T00:00:00',
    paid_date: '2025-05-18T00:00:00'
  },
  'INV-4025017': {
    id: 'INV-4025017',
    invoice_number: 'INV-4025017',
    po_number: 'PO-2025022',
    supplier_id: 'SUP-1028',
    supplier_name: 'DocuVault Systems',
    amount: 56000,
    currency: 'USD',
    status: 'Approved',
    due_date: '2025-07-15T00:00:00',
    created_date: '2025-06-20T00:00:00'
  },
  'INV-4025018': {
    id: 'INV-4025018',
    invoice_number: 'INV-4025018',
    po_number: 'PO-2025023',
    supplier_id: 'SUP-1031',
    supplier_name: 'TeamSync Pro',
    amount: 72000,
    currency: 'USD',
    status: 'Paid',
    due_date: '2025-02-22T00:00:00',
    created_date: '2025-01-28T00:00:00',
    paid_date: '2025-02-20T00:00:00'
  },
  'INV-4025019': {
    id: 'INV-4025019',
    invoice_number: 'INV-4025019',
    po_number: 'PO-2025025',
    supplier_id: 'SUP-1035',
    supplier_name: 'DeployMaster Inc',
    amount: 165000,
    currency: 'USD',
    status: 'Paid',
    due_date: '2025-04-15T00:00:00',
    created_date: '2025-03-20T00:00:00',
    paid_date: '2025-04-12T00:00:00'
  },
  'INV-4025020': {
    id: 'INV-4025020',
    invoice_number: 'INV-4025020',
    po_number: 'PO-2025027',
    supplier_id: 'SUP-1038',
    supplier_name: 'NeuralPath AI',
    amount: 480000,
    currency: 'USD',
    status: 'Under Review',
    due_date: '2025-05-01T00:00:00',
    created_date: '2025-04-05T00:00:00',
    anomaly_flag: 'Invoice amount matches inflated PO — contract value is $400,000'
  },
  'INV-4025021': {
    id: 'INV-4025021',
    invoice_number: 'INV-4025021',
    po_number: 'PO-2025028',
    supplier_id: 'SUP-1039',
    supplier_name: 'DeepSense Technologies',
    amount: 225000,
    currency: 'GBP',
    status: 'Approved',
    due_date: '2025-07-20T00:00:00',
    created_date: '2025-06-25T00:00:00'
  },
  'INV-4025022': {
    id: 'INV-4025022',
    invoice_number: 'INV-4025022',
    po_number: 'PO-2025029',
    supplier_id: 'SUP-1042',
    supplier_name: 'FinLedger Systems',
    amount: 155000,
    currency: 'USD',
    status: 'Paid',
    due_date: '2025-03-05T00:00:00',
    created_date: '2025-02-10T00:00:00',
    paid_date: '2025-03-03T00:00:00'
  },
  'INV-4025023': {
    id: 'INV-4025023',
    invoice_number: 'INV-4025023',
    po_number: 'PO-2025031',
    supplier_id: 'SUP-1045',
    supplier_name: 'ProjectBeam Inc',
    amount: 67000,
    currency: 'USD',
    status: 'Paid',
    due_date: '2025-04-22T00:00:00',
    created_date: '2025-03-28T00:00:00',
    paid_date: '2025-04-20T00:00:00'
  },
  'INV-4025024': {
    id: 'INV-4025024',
    invoice_number: 'INV-4025024',
    po_number: 'PO-2025032',
    supplier_id: 'SUP-1048',
    supplier_name: 'TrustGate Security',
    amount: 142000,
    currency: 'USD',
    status: 'Approved',
    due_date: '2025-06-10T00:00:00',
    created_date: '2025-05-15T00:00:00'
  },
  'INV-4025025': {
    id: 'INV-4025025',
    invoice_number: 'INV-4025025',
    po_number: 'PO-2025034',
    supplier_id: 'SUP-1051',
    supplier_name: 'VaultRecover Inc',
    amount: 310000,
    currency: 'USD',
    status: 'Under Review',
    due_date: '2025-05-12T00:00:00',
    created_date: '2025-04-18T00:00:00'
  },
  'INV-4025026': {
    id: 'INV-4025026',
    invoice_number: 'INV-4025026',
    po_number: 'PO-2025015',
    supplier_id: 'SUP-1017',
    supplier_name: 'DataLens France SAS',
    amount: 78000,
    currency: 'EUR',
    status: 'Overdue',
    due_date: '2025-08-12T00:00:00',
    created_date: '2025-07-18T00:00:00'
  },
  'INV-4025027': {
    id: 'INV-4025027',
    invoice_number: 'INV-4025027',
    po_number: 'PO-2025017',
    supplier_id: 'SUP-1020',
    supplier_name: 'HelixITSM AB',
    amount: 88000,
    currency: 'EUR',
    status: 'Approved',
    due_date: '2025-06-18T00:00:00',
    created_date: '2025-05-22T00:00:00'
  },
  'INV-4025028': {
    id: 'INV-4025028',
    invoice_number: 'INV-4025028',
    po_number: 'PO-2025024',
    supplier_id: 'SUP-1032',
    supplier_name: 'CollabWorks France SAS',
    amount: 98000,
    currency: 'EUR',
    status: 'Under Review',
    due_date: '2025-06-30T00:00:00',
    created_date: '2025-06-05T00:00:00'
  },
  'INV-4025029': {
    id: 'INV-4025029',
    invoice_number: 'INV-4025029',
    po_number: 'PO-2025030',
    supplier_id: 'SUP-1043',
    supplier_name: 'EuroFinTech GmbH',
    amount: 245000,
    currency: 'EUR',
    status: 'Rejected',
    due_date: '2025-09-15T00:00:00',
    created_date: '2025-08-20T00:00:00',
    anomaly_flag: 'Invoice amount (€245,000) exceeds PO amount (€198,000) by €47,000',
    rejection_reason: 'Amount mismatch — requires supplier credit note'
  },
  'INV-4025030': {
    id: 'INV-4025030',
    invoice_number: 'INV-4025030',
    po_number: 'PO-2025009',
    supplier_id: 'SUP-1009',
    supplier_name: 'ShieldNet Cyber',
    amount: 175000,
    currency: 'USD',
    status: 'Rejected',
    due_date: '2025-03-25T00:00:00',
    created_date: '2025-03-01T00:00:00',
    anomaly_flag: 'Duplicate invoice — INV-4025009 already submitted for PO-2025009',
    rejection_reason: 'Duplicate invoice detected'
  },
  'INV-4025031': {
    id: 'INV-4025031',
    invoice_number: 'INV-4025031',
    po_number: 'PO-2025035',
    supplier_id: 'SUP-1052',
    supplier_name: 'DataSafe UK Ltd',
    amount: 178000,
    currency: 'GBP',
    status: 'Under Review',
    due_date: '2025-08-30T00:00:00',
    created_date: '2025-08-05T00:00:00'
  }
};

const contractsDb: Record<string, Contract> = {
  'CON-5024001': {
    id: 'CON-5024001',
    contract_number: 'CON-5024001',
    title: 'Enterprise ERP License and Support Agreement - ERPMax Solutions',
    supplier_id: 'SUP-1000',
    supplier_name: 'ERPMax Solutions',
    start_date: '2024-06-01T00:00:00',
    end_date: '2027-05-31T00:00:00',
    value: 450000,
    currency: 'USD',
    status: 'Active'
  },
  'CON-5025001': {
    id: 'CON-5025001',
    contract_number: 'CON-5025001',
    title: 'Pilot Program Agreement - CloudFirst ERP',
    supplier_id: 'SUP-1002',
    supplier_name: 'CloudFirst ERP',
    start_date: '2025-03-01T00:00:00',
    end_date: '2025-12-31T00:00:00',
    value: 25000,
    currency: 'USD',
    status: 'Active'
  },
  'CON-5023001': {
    id: 'CON-5023001',
    contract_number: 'CON-5023001',
    title: 'Legacy System Maintenance - ERPMax Solutions',
    supplier_id: 'SUP-1000',
    supplier_name: 'ERPMax Solutions',
    start_date: '2022-01-01T00:00:00',
    end_date: '2024-05-31T00:00:00',
    value: 180000,
    currency: 'USD',
    status: 'Expired'
  },
  'CON-5025002': {
    id: 'CON-5025002',
    contract_number: 'CON-5025002',
    title: 'CRM Platform License — Apex CRM Solutions',
    supplier_id: 'SUP-1005',
    supplier_name: 'Apex CRM Solutions',
    start_date: '2025-01-01T00:00:00',
    end_date: '2027-12-31T00:00:00',
    value: 250000,
    currency: 'USD',
    status: 'Active'
  },
  'CON-5025003': {
    id: 'CON-5025003',
    contract_number: 'CON-5025003',
    title: 'CRM SaaS Agreement — RelateIQ Technologies',
    supplier_id: 'SUP-1006',
    supplier_name: 'RelateIQ Technologies',
    start_date: '2025-03-01T00:00:00',
    end_date: '2027-02-28T00:00:00',
    value: 180000,
    currency: 'GBP',
    status: 'Active'
  },
  'CON-5025004': {
    id: 'CON-5025004',
    contract_number: 'CON-5025004',
    title: 'Enterprise Cybersecurity Suite — ShieldNet Cyber',
    supplier_id: 'SUP-1009',
    supplier_name: 'ShieldNet Cyber',
    start_date: '2024-06-01T00:00:00',
    end_date: '2027-05-31T00:00:00',
    value: 520000,
    currency: 'USD',
    status: 'Active'
  },
  'CON-5025005': {
    id: 'CON-5025005',
    contract_number: 'CON-5025005',
    title: 'Cloud Infrastructure Services — NimbusScale Cloud',
    supplier_id: 'SUP-1012',
    supplier_name: 'NimbusScale Cloud',
    start_date: '2025-04-01T00:00:00',
    end_date: '2028-03-31T00:00:00',
    value: 960000,
    currency: 'USD',
    status: 'Active'
  },
  'CON-5025006': {
    id: 'CON-5025006',
    contract_number: 'CON-5025006',
    title: 'Hybrid Cloud Platform — CloudBridge Europe BV',
    supplier_id: 'SUP-1013',
    supplier_name: 'CloudBridge Europe BV',
    start_date: '2025-05-01T00:00:00',
    end_date: '2027-04-30T00:00:00',
    value: 420000,
    currency: 'EUR',
    status: 'Pending Signature'
  },
  'CON-5025007': {
    id: 'CON-5025007',
    contract_number: 'CON-5025007',
    title: 'Cloud Migration Services — SkyTier Infrastructure',
    supplier_id: 'SUP-1014',
    supplier_name: 'SkyTier Infrastructure',
    start_date: '2024-10-01T00:00:00',
    end_date: '2026-09-30T00:00:00',
    value: 580000,
    currency: 'CAD',
    status: 'Active'
  },
  'CON-5025008': {
    id: 'CON-5025008',
    contract_number: 'CON-5025008',
    title: 'Analytics Platform License — InsightWave Analytics',
    supplier_id: 'SUP-1016',
    supplier_name: 'InsightWave Analytics',
    start_date: '2025-02-01T00:00:00',
    end_date: '2027-01-31T00:00:00',
    value: 280000,
    currency: 'USD',
    status: 'Active'
  },
  'CON-5025009': {
    id: 'CON-5025009',
    contract_number: 'CON-5025009',
    title: 'ITSM Platform Agreement — ServiceGrid Technologies',
    supplier_id: 'SUP-1019',
    supplier_name: 'ServiceGrid Technologies',
    start_date: '2024-08-01T00:00:00',
    end_date: '2026-07-31T00:00:00',
    value: 340000,
    currency: 'USD',
    status: 'Active'
  },
  'CON-5025010': {
    id: 'CON-5025010',
    contract_number: 'CON-5025010',
    title: 'HR Management System — PeopleSync HR',
    supplier_id: 'SUP-1022',
    supplier_name: 'PeopleSync HR',
    start_date: '2025-06-01T00:00:00',
    end_date: '2028-05-31T00:00:00',
    value: 450000,
    currency: 'USD',
    status: 'Pending Signature'
  },
  'CON-5025011': {
    id: 'CON-5025011',
    contract_number: 'CON-5025011',
    title: 'Supply Chain Platform — ChainLink Logistics Tech',
    supplier_id: 'SUP-1025',
    supplier_name: 'ChainLink Logistics Tech',
    start_date: '2024-12-01T00:00:00',
    end_date: '2027-11-30T00:00:00',
    value: 720000,
    currency: 'USD',
    status: 'Active'
  },
  'CON-5025012': {
    id: 'CON-5025012',
    contract_number: 'CON-5025012',
    title: 'SCM Analytics Module — TraceFlow GmbH',
    supplier_id: 'SUP-1026',
    supplier_name: 'TraceFlow GmbH',
    start_date: '2025-01-15T00:00:00',
    end_date: '2026-01-14T00:00:00',
    value: 195000,
    currency: 'EUR',
    status: 'Active'
  },
  'CON-5025013': {
    id: 'CON-5025013',
    contract_number: 'CON-5025013',
    title: 'Collaboration Suite License — TeamSync Pro',
    supplier_id: 'SUP-1031',
    supplier_name: 'TeamSync Pro',
    start_date: '2024-09-01T00:00:00',
    end_date: '2025-08-31T00:00:00',
    value: 120000,
    currency: 'USD',
    status: 'Expired',
    anomaly_flag: 'Contract expired but PO-2025023 was issued during active period'
  },
  'CON-5025014': {
    id: 'CON-5025014',
    contract_number: 'CON-5025014',
    title: 'DevOps Toolchain — DeployMaster Inc',
    supplier_id: 'SUP-1035',
    supplier_name: 'DeployMaster Inc',
    start_date: '2025-01-01T00:00:00',
    end_date: '2027-12-31T00:00:00',
    value: 490000,
    currency: 'USD',
    status: 'Active'
  },
  'CON-5025015': {
    id: 'CON-5025015',
    contract_number: 'CON-5025015',
    title: 'AI/ML Platform License — NeuralPath AI',
    supplier_id: 'SUP-1038',
    supplier_name: 'NeuralPath AI',
    start_date: '2025-02-01T00:00:00',
    end_date: '2028-01-31T00:00:00',
    value: 400000,
    currency: 'USD',
    status: 'Active',
    anomaly_flag: 'Active PO (PO-2025027) exceeds contract value by $80,000'
  },
  'CON-5025016': {
    id: 'CON-5025016',
    contract_number: 'CON-5025016',
    title: 'Machine Learning Consulting — DeepSense Technologies',
    supplier_id: 'SUP-1039',
    supplier_name: 'DeepSense Technologies',
    start_date: '2025-05-01T00:00:00',
    end_date: '2027-04-30T00:00:00',
    value: 650000,
    currency: 'GBP',
    status: 'Active'
  },
  'CON-5025017': {
    id: 'CON-5025017',
    contract_number: 'CON-5025017',
    title: 'Financial ERP Module — FinLedger Systems',
    supplier_id: 'SUP-1042',
    supplier_name: 'FinLedger Systems',
    start_date: '2024-03-01T00:00:00',
    end_date: '2026-02-28T00:00:00',
    value: 360000,
    currency: 'USD',
    status: 'Active'
  },
  'CON-5025018': {
    id: 'CON-5025018',
    contract_number: 'CON-5025018',
    title: 'IAM Platform Agreement — TrustGate Security',
    supplier_id: 'SUP-1048',
    supplier_name: 'TrustGate Security',
    start_date: '2025-03-01T00:00:00',
    end_date: '2028-02-29T00:00:00',
    value: 410000,
    currency: 'USD',
    status: 'Active'
  },
  'CON-5025019': {
    id: 'CON-5025019',
    contract_number: 'CON-5025019',
    title: 'Backup & DR Services — VaultRecover Inc',
    supplier_id: 'SUP-1051',
    supplier_name: 'VaultRecover Inc',
    start_date: '2025-01-15T00:00:00',
    end_date: '2027-01-14T00:00:00',
    value: 580000,
    currency: 'USD',
    status: 'Active'
  },
  'CON-5025020': {
    id: 'CON-5025020',
    contract_number: 'CON-5025020',
    title: 'Disaster Recovery Platform — DataSafe UK Ltd',
    supplier_id: 'SUP-1052',
    supplier_name: 'DataSafe UK Ltd',
    start_date: '2025-06-01T00:00:00',
    end_date: '2027-05-31T00:00:00',
    value: 390000,
    currency: 'GBP',
    status: 'Pending Signature'
  },
  'CON-5025021': {
    id: 'CON-5025021',
    contract_number: 'CON-5025021',
    title: 'Cloud Hosting Agreement — AsiaPacific Cloud Corp',
    supplier_id: 'SUP-1015',
    supplier_name: 'AsiaPacific Cloud Corp',
    start_date: '2025-07-01T00:00:00',
    end_date: '2028-06-30T00:00:00',
    value: 1200000,
    currency: 'USD',
    status: 'Pending Signature'
  }
};

const rfpsDb: Record<string, Rfp> = {
  'RFP-2026-001': {
    id: 'RFP-2026-001',
    title: 'Enterprise ERP System Implementation',
    status: 'Open',
    deadline: '2026-04-30T00:00:00',
    budget_max: 500000,
    currency: 'USD',
    requirements: [
      { id: 'REQ-001', category: 'Functional', description: 'Multi-currency support', priority: 'Must-have', weight: 10 },
      { id: 'REQ-002', category: 'Integration', description: 'SAP S/4HANA integration', priority: 'Must-have', weight: 10 }
    ]
  },
  'RFP-2026-002': {
    id: 'RFP-2026-002',
    title: 'Logistics Management Platform',
    status: 'Open',
    deadline: '2026-05-15T00:00:00',
    budget_max: 300000,
    currency: 'USD',
    requirements: [
      { id: 'REQ-001', category: 'Functional', description: 'Route optimization', priority: 'Must-have', weight: 10 }
    ]
  },
  'RFP-2026-003': {
    id: 'RFP-2026-003',
    title: 'Enterprise Cybersecurity Platform Modernization',
    status: 'Open',
    deadline: '2026-06-30T00:00:00',
    budget_max: 800000,
    currency: 'USD',
    requirements: [
      { id: 'REQ-001', category: 'Security', description: 'Zero-trust architecture support', priority: 'Must-have', weight: 10 },
      { id: 'REQ-002', category: 'Compliance', description: 'SOC 2 Type II and ISO 27001 certification', priority: 'Must-have', weight: 10 },
      { id: 'REQ-003', category: 'Integration', description: 'SIEM and SOAR platform integration', priority: 'Should-have', weight: 7 },
      { id: 'REQ-004', category: 'Functional', description: 'Real-time threat detection and response', priority: 'Must-have', weight: 10 }
    ]
  },
  'RFP-2026-004': {
    id: 'RFP-2026-004',
    title: 'Cloud Infrastructure Migration and Hosting',
    status: 'Open',
    deadline: '2026-07-15T00:00:00',
    budget_max: 1500000,
    currency: 'USD',
    requirements: [
      { id: 'REQ-001', category: 'Infrastructure', description: 'Multi-region deployment with 99.99% SLA', priority: 'Must-have', weight: 10 },
      { id: 'REQ-002', category: 'Security', description: 'Data encryption at rest and in transit', priority: 'Must-have', weight: 10 },
      { id: 'REQ-003', category: 'Migration', description: 'Zero-downtime migration strategy', priority: 'Should-have', weight: 8 }
    ]
  },
  'RFP-2026-005': {
    id: 'RFP-2026-005',
    title: 'AI and Machine Learning Platform Implementation',
    status: 'Closed',
    deadline: '2026-03-31T00:00:00',
    budget_max: 600000,
    currency: 'USD',
    requirements: [
      { id: 'REQ-001', category: 'Functional', description: 'AutoML capabilities for non-technical users', priority: 'Must-have', weight: 10 },
      { id: 'REQ-002', category: 'Integration', description: 'Native integration with major cloud providers', priority: 'Should-have', weight: 8 },
      { id: 'REQ-003', category: 'Scalability', description: 'Support for distributed training on GPU clusters', priority: 'Must-have', weight: 10 },
      { id: 'REQ-004', category: 'Governance', description: 'Model versioning and audit trail', priority: 'Should-have', weight: 7 }
    ]
  },
  'RFP-2026-006': {
    id: 'RFP-2026-006',
    title: 'HR Management and Payroll System Upgrade',
    status: 'Open',
    deadline: '2026-08-31T00:00:00',
    budget_max: 350000,
    currency: 'USD',
    requirements: [
      { id: 'REQ-001', category: 'Functional', description: 'Multi-country payroll processing', priority: 'Must-have', weight: 10 },
      { id: 'REQ-002', category: 'Compliance', description: 'GDPR and local labor law compliance', priority: 'Must-have', weight: 10 }
    ]
  }
};

const proposalsDb: Record<string, Proposal> = {
  'PROP-6024001': {
    id: 'PROP-6024001',
    rfp_id: 'RFP-2026-001',
    supplier_id: 'SUP-1000',
    supplier_name: 'ERPMax Solutions',
    status: 'Under Review',
    submitted_date: '2026-01-25T00:00:00',
    pricing: {
      total: 390000,
      currency: 'USD'
    },
    delivery_weeks: 16,
    validity_days: 90
  },
  'PROP-6024002': {
    id: 'PROP-6024002',
    rfp_id: 'RFP-2026-001',
    supplier_id: 'SUP-1001',
    supplier_name: 'IntegraPro Systems',
    status: 'Under Review',
    submitted_date: '2026-01-28T00:00:00',
    pricing: {
      total: 450000,
      currency: 'USD'
    },
    delivery_weeks: 20,
    validity_days: 60
  },
  'PROP-6024003': {
    id: 'PROP-6024003',
    rfp_id: 'RFP-2026-001',
    supplier_id: 'SUP-1002',
    supplier_name: 'CloudFirst ERP',
    status: 'Under Review',
    submitted_date: '2026-01-30T00:00:00',
    pricing: {
      total: 290000,
      currency: 'USD'
    },
    delivery_weeks: 12,
    validity_days: 90
  },
  'PROP-6024004': {
    id: 'PROP-6024004',
    rfp_id: 'RFP-2026-003',
    supplier_id: 'SUP-1009',
    supplier_name: 'ShieldNet Cyber',
    status: 'Under Review',
    submitted_date: '2026-04-10T00:00:00',
    pricing: {
      total: 720000,
      currency: 'USD'
    },
    delivery_weeks: 20,
    validity_days: 90
  },
  'PROP-6024005': {
    id: 'PROP-6024005',
    rfp_id: 'RFP-2026-003',
    supplier_id: 'SUP-1010',
    supplier_name: 'Fortiguard Systems Inc',
    status: 'Under Review',
    submitted_date: '2026-04-15T00:00:00',
    pricing: {
      total: 685000,
      currency: 'USD'
    },
    delivery_weeks: 18,
    validity_days: 90
  },
  'PROP-6024006': {
    id: 'PROP-6024006',
    rfp_id: 'RFP-2026-004',
    supplier_id: 'SUP-1012',
    supplier_name: 'NimbusScale Cloud',
    status: 'Under Review',
    submitted_date: '2026-05-01T00:00:00',
    pricing: {
      total: 1350000,
      currency: 'USD'
    },
    delivery_weeks: 24,
    validity_days: 120
  },
  'PROP-6024007': {
    id: 'PROP-6024007',
    rfp_id: 'RFP-2026-004',
    supplier_id: 'SUP-1014',
    supplier_name: 'SkyTier Infrastructure',
    status: 'Under Review',
    submitted_date: '2026-05-05T00:00:00',
    pricing: {
      total: 1180000,
      currency: 'USD'
    },
    delivery_weeks: 20,
    validity_days: 90
  },
  'PROP-6024008': {
    id: 'PROP-6024008',
    rfp_id: 'RFP-2026-004',
    supplier_id: 'SUP-1013',
    supplier_name: 'CloudBridge Europe BV',
    status: 'Under Review',
    submitted_date: '2026-05-08T00:00:00',
    pricing: {
      total: 1420000,
      currency: 'USD'
    },
    delivery_weeks: 22,
    validity_days: 60
  },
  'PROP-6024009': {
    id: 'PROP-6024009',
    rfp_id: 'RFP-2026-005',
    supplier_id: 'SUP-1038',
    supplier_name: 'NeuralPath AI',
    status: 'Accepted',
    submitted_date: '2026-02-10T00:00:00',
    pricing: {
      total: 540000,
      currency: 'USD'
    },
    delivery_weeks: 16,
    validity_days: 90
  },
  'PROP-6024010': {
    id: 'PROP-6024010',
    rfp_id: 'RFP-2026-005',
    supplier_id: 'SUP-1039',
    supplier_name: 'DeepSense Technologies',
    status: 'Rejected',
    submitted_date: '2026-02-15T00:00:00',
    pricing: {
      total: 590000,
      currency: 'USD'
    },
    delivery_weeks: 22,
    validity_days: 60
  },
  'PROP-6024011': {
    id: 'PROP-6024011',
    rfp_id: 'RFP-2026-005',
    supplier_id: 'SUP-1040',
    supplier_name: 'CogniWare Japan KK',
    status: 'Rejected',
    submitted_date: '2026-02-20T00:00:00',
    pricing: {
      total: 480000,
      currency: 'USD'
    },
    delivery_weeks: 18,
    validity_days: 90
  },
  'PROP-6024012': {
    id: 'PROP-6024012',
    rfp_id: 'RFP-2026-006',
    supplier_id: 'SUP-1022',
    supplier_name: 'PeopleSync HR',
    status: 'Under Review',
    submitted_date: '2026-06-15T00:00:00',
    pricing: {
      total: 310000,
      currency: 'USD'
    },
    delivery_weeks: 14,
    validity_days: 90
  },
  'PROP-6024013': {
    id: 'PROP-6024013',
    rfp_id: 'RFP-2026-006',
    supplier_id: 'SUP-1023',
    supplier_name: 'TalentForge Solutions',
    status: 'Under Review',
    submitted_date: '2026-06-20T00:00:00',
    pricing: {
      total: 285000,
      currency: 'USD'
    },
    delivery_weeks: 12,
    validity_days: 120
  }
};

function notFound(entity: string, id: string) {
  return { error: `${entity} '${id}' not found` };
}

//======================================================================
// DASHBOARD API
// Description: Retourne une vue agrégée des principaux indicateurs métier.
// Entrants: aucun.
// Sortants: objet avec compteurs et montants (suppliers, purchase_orders,
// requisitions, invoices, contracts).
//======================================================================
export function getDashboardSummary() {
  const suppliers = Object.values(suppliersDb);
  const purchaseOrders = Object.values(purchaseOrdersDb);
  const requisitions = Object.values(requisitionsDb);
  const invoices = Object.values(invoicesDb);
  const contracts = Object.values(contractsDb);

  return {
    suppliers: {
      total: suppliers.length,
      active: suppliers.filter((s) => s.status === 'Active').length
    },
    purchase_orders: {
      total: purchaseOrders.length,
      pending: purchaseOrders.filter((p) => p.status === 'Draft' || p.status === 'Pending Approval').length,
      total_value: purchaseOrders.reduce((sum, p) => sum + p.total_amount, 0)
    },
    requisitions: {
      total: requisitions.length,
      pending_approval: requisitions.filter((r) => r.approval_status === 'Pending').length
    },
    invoices: {
      total: invoices.length,
      pending_payment: invoices.filter((i) => i.status === 'Approved' || i.status === 'Under Review').length,
      total_value: invoices.reduce((sum, i) => sum + i.amount, 0)
    },
    contracts: {
      total: contracts.length,
      active: contracts.filter((c) => c.status === 'Active').length,
      total_value: contracts.reduce((sum, c) => sum + c.value, 0)
    }
  };
}

//======================================================================
// SUPPLIERS API
// Description: Liste les fournisseurs avec filtres optionnels et récupère
// un fournisseur par identifiant.
// Entrants:
// - getSuppliers(filters?): { status?: string; category?: string }
// - getSupplier(supplierId): string
// Sortants:
// - getSuppliers: Supplier[]
// - getSupplier: Supplier | { error: string }
//======================================================================
export function getSuppliers(filters?: { status?: string; category?: string }) {
  let suppliers = Object.values(suppliersDb);

  if (filters?.status) {
    suppliers = suppliers.filter((s) => s.status.toLowerCase() === filters.status?.toLowerCase());
  }
  if (filters?.category) {
    suppliers = suppliers.filter((s) => s.category.toLowerCase() === filters.category?.toLowerCase());
  }

  return suppliers;
}

export function getSupplier(supplierId: string) {
  return suppliersDb[supplierId] ?? notFound('Supplier', supplierId);
}

//======================================================================
// PURCHASE ORDERS API
// Description: Liste les bons de commande avec filtres optionnels et récupère
// un bon de commande par identifiant.
// Entrants:
// - getPurchaseOrders(filters?): { status?: string; supplier_id?: string }
// - getPurchaseOrder(poId): string
// Sortants:
// - getPurchaseOrders: PurchaseOrder[]
// - getPurchaseOrder: PurchaseOrder | { error: string }
//======================================================================
export function getPurchaseOrders(filters?: { status?: string; supplier_id?: string }) {
  let orders = Object.values(purchaseOrdersDb);

  if (filters?.status) {
    orders = orders.filter((o) => o.status.toLowerCase() === filters.status?.toLowerCase());
  }
  if (filters?.supplier_id) {
    orders = orders.filter((o) => o.supplier_id === filters.supplier_id);
  }

  return orders;
}

export function getPurchaseOrder(poId: string) {
  return purchaseOrdersDb[poId] ?? notFound('Purchase order', poId);
}

//======================================================================
// REQUISITIONS API
// Description: Liste les demandes d'achat avec filtres optionnels et récupère
// une demande d'achat par identifiant.
// Entrants:
// - getRequisitions(filters?): { status?: string; requester?: string }
// - getRequisition(reqId): string
// Sortants:
// - getRequisitions: Requisition[]
// - getRequisition: Requisition | { error: string }
//======================================================================
export function getRequisitions(filters?: { status?: string; requester?: string }) {
  let requisitions = Object.values(requisitionsDb);

  if (filters?.status) {
    requisitions = requisitions.filter((r) => r.status.toLowerCase() === filters.status?.toLowerCase());
  }
  if (filters?.requester) {
    requisitions = requisitions.filter((r) => r.requester.toLowerCase().includes(filters.requester?.toLowerCase() ?? ''));
  }

  return requisitions;
}

export function getRequisition(reqId: string) {
  return requisitionsDb[reqId] ?? notFound('Requisition', reqId);
}

//======================================================================
// INVOICES API
// Description: Liste les factures avec filtres optionnels et récupère une
// facture par identifiant.
// Entrants:
// - getInvoices(filters?): { status?: string; po_number?: string }
// - getInvoice(invoiceId): string
// Sortants:
// - getInvoices: Invoice[]
// - getInvoice: Invoice | { error: string }
//======================================================================
export function getInvoices(filters?: { status?: string; po_number?: string }) {
  let invoices = Object.values(invoicesDb);

  if (filters?.status) {
    invoices = invoices.filter((i) => i.status.toLowerCase() === filters.status?.toLowerCase());
  }
  if (filters?.po_number) {
    invoices = invoices.filter((i) => i.po_number === filters.po_number);
  }

  return invoices;
}

export function getInvoice(invoiceId: string) {
  return invoicesDb[invoiceId] ?? notFound('Invoice', invoiceId);
}

//======================================================================
// CONTRACTS API
// Description: Liste les contrats avec filtres optionnels et récupère un
// contrat par identifiant.
// Entrants:
// - getContracts(filters?): { status?: string; supplier_name?: string }
// - getContract(contractId): string
// Sortants:
// - getContracts: Contract[]
// - getContract: Contract | { error: string }
//======================================================================
export function getContracts(filters?: { status?: string; supplier_name?: string }) {
  let contracts = Object.values(contractsDb);

  if (filters?.status) {
    contracts = contracts.filter((c) => c.status.toLowerCase() === filters.status?.toLowerCase());
  }
  if (filters?.supplier_name) {
    contracts = contracts.filter((c) => c.supplier_name.toLowerCase().includes(filters.supplier_name?.toLowerCase() ?? ''));
  }

  return contracts;
}

export function getContract(contractId: string) {
  return contractsDb[contractId] ?? notFound('Contract', contractId);
}

//======================================================================
// PROPOSALS API
// Description: Liste les propositions fournisseurs avec filtres optionnels
// et récupère une proposition par identifiant.
// Entrants:
// - getProposals(filters?): { rfp_id?: string; supplier_id?: string; status?: string }
// - getProposal(proposalId): string
// Sortants:
// - getProposals: Proposal[]
// - getProposal: Proposal | { error: string }
//======================================================================
export function getProposals(filters?: { rfp_id?: string; supplier_id?: string; status?: string }) {
  let proposals = Object.values(proposalsDb);

  if (filters?.rfp_id) {
    proposals = proposals.filter((p) => p.rfp_id === filters.rfp_id);
  }
  if (filters?.supplier_id) {
    proposals = proposals.filter((p) => p.supplier_id === filters.supplier_id);
  }
  if (filters?.status) {
    proposals = proposals.filter((p) => p.status.toLowerCase() === filters.status?.toLowerCase());
  }

  return proposals;
}

export function getProposal(proposalId: string) {
  return proposalsDb[proposalId] ?? notFound('Proposal', proposalId);
}

//======================================================================
// RFPS API
// Description: Liste les appels d'offres (RFP) avec filtre optionnel et
// récupère un RFP par identifiant.
// Entrants:
// - getRfps(filters?): { status?: string }
// - getRfp(rfpId): string
// Sortants:
// - getRfps: Rfp[]
// - getRfp: Rfp | { error: string }
//======================================================================
export function getRfps(filters?: { status?: string }) {
  let rfps = Object.values(rfpsDb);

  if (filters?.status) {
    rfps = rfps.filter((r) => r.status.toLowerCase() === filters.status?.toLowerCase());
  }

  return rfps;
}

export function getRfp(rfpId: string) {
  return rfpsDb[rfpId] ?? notFound('RFP', rfpId);
}

//======================================================================
// RISK API
// Description: Calcule et renvoie un profil de risque pour un fournisseur
// à partir de son score.
// Entrants:
// - getRiskScore(supplierId): string
// Sortants:
// - objet de risque (supplier_id, supplier_name, risk_score, risk_level,
// factors[]) ou { error: string }
//======================================================================
export function getRiskScore(supplierId: string) {
  const supplier = suppliersDb[supplierId];

  if (!supplier) {
    return notFound('Supplier', supplierId);
  }

  const score = supplier.risk_score;
  const riskLevel = score >= 7 ? 'High' : score >= 4 ? 'Medium' : 'Low';

  return {
    supplier_id: supplier.id,
    supplier_name: supplier.name,
    risk_score: score,
    risk_level: riskLevel,
    factors: [
      { name: 'Operational Stability', weight: 0.35, score: Number((score * 0.9).toFixed(2)) },
      { name: 'Financial Health', weight: 0.4, score: Number((score * 1.1).toFixed(2)) },
      { name: 'Compliance & Security', weight: 0.25, score: Number((score * 1.0).toFixed(2)) }
    ]
  };
}
