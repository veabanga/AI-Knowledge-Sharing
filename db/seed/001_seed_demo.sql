INSERT INTO organisations (id, name) VALUES ('11111111-1111-1111-1111-111111111111', 'Auron Mobility');

INSERT INTO departments (id, organisation_id, name) VALUES
('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Mechanical Engineering'),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Electrical Engineering'),
('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Software Engineering'),
('22222222-2222-2222-2222-222222222224', '11111111-1111-1111-1111-111111111111', 'Manufacturing Engineering');

INSERT INTO employees (id, department_id, name, role, experience_years) VALUES
('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222221', 'Alex Morgan', 'Senior Mechanical Engineer', 12),
('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222223', 'Sarah Chen', 'Embedded Software Engineer', 8),
('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Michael Weber', 'Electrical Engineer', 10),
('33333333-3333-3333-3333-333333333334', '22222222-2222-2222-2222-222222222224', 'David Miller', 'Manufacturing Engineer', 7);

INSERT INTO projects (id, name, owner_id, description) VALUES
('44444444-4444-4444-4444-444444444441', 'Automotive Sensor Development', '33333333-3333-3333-3333-333333333331', 'Thermal and mechanical tuning for the next-generation sensor platform'),
('44444444-4444-4444-4444-444444444442', 'Embedded Sensor Software', '33333333-3333-3333-3333-333333333332', 'Firmware and embedded control logic for sensor calibration'),
('44444444-4444-4444-4444-444444444443', 'Sensor Manufacturing Integration', '33333333-3333-3333-3333-333333333334', 'Scaling manufacturing with inline validation and process capability controls');

INSERT INTO sprints (id, project_id, name, start_date, end_date, status, summary) VALUES
('55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444441', 'S5 - Calibration validation', '2026-08-01', '2026-08-14', 'completed', 'Thermal validation and calibration balancing'),
('55555555-5555-5555-5555-555555555552', '44444444-4444-4444-4444-444444444442', 'S4 - Firmware tuning', '2026-08-15', '2026-08-29', 'completed', 'Low-noise mode tuning and drift investigation'),
('55555555-5555-5555-5555-555555555553', '44444444-4444-4444-4444-444444444443', 'S3 - Process capability ramp', '2026-09-01', '2026-09-21', 'completed', 'Inline burn-in and package readiness');

INSERT INTO issues (id, project_id, key_ref, title, status, assignee_id) VALUES
('66666666-6666-6666-6666-666666666661', '44444444-4444-4444-4444-444444444441', 'ENG-2049', 'Thermal distortion on housing wall', 'resolved', '33333333-3333-3333-3333-333333333331'),
('66666666-6666-6666-6666-666666666662', '44444444-4444-4444-4444-444444444442', 'ENG-1172', 'Sensor noise floor drift in low-noise mode', 'in_progress', '33333333-3333-3333-3333-333333333332'),
('66666666-6666-6666-6666-666666666663', '44444444-4444-4444-4444-444444444443', 'MFG-330', 'Inline test throughput below target', 'resolved', '33333333-3333-3333-3333-333333333334');

INSERT INTO source_records (id, project_id, source_type, title) VALUES
('77777777-7777-7777-7777-777777777771', '44444444-4444-4444-4444-444444444441', 'document', 'Thermal housing design review'),
('77777777-7777-7777-7777-777777777772', '44444444-4444-4444-4444-444444444442', 'jira', 'ENG-1172 Calibration ticket'),
('77777777-7777-7777-7777-777777777773', '44444444-4444-4444-4444-444444444443', 'email', 'Manufacturing validation summary');

INSERT INTO knowledge_items (id, title, knowledge_type, description, confidence_score, validation_status) VALUES
('88888888-8888-8888-8888-888888888881', 'Thermal housing redesign reduces sensor drifting', 'Decision', 'Composite engineering change stabilized the thermal envelope and narrowed the calibration window.', 0.92, 'validated'),
('88888888-8888-8888-8888-888888888882', 'Firmware calibration issue linked to sensor noise floor', 'Problem', 'Firmware timing in low-noise mode amplified thermal sensitivity and sensor variance.', 0.88, 'review pending'),
('88888888-8888-8888-8888-888888888883', 'Inline burn-in gate required before packaging', 'Requirement', 'Manufacturing validation identified a required burn-in gate before final packaging.', 0.90, 'validated');

INSERT INTO knowledge_relations (id, source_item_id, target_item_id, relation_type, confidence_score, is_confirmed) VALUES
('99999999-9999-9999-9999-999999999991', '88888888-8888-8888-8888-888888888881', '88888888-8888-8888-8888-888888888882', 'AFFECTS', 0.90, TRUE),
('99999999-9999-9999-9999-999999999992', '88888888-8888-8888-8888-888888888882', '88888888-8888-8888-8888-888888888883', 'DEPENDS_ON', 0.83, TRUE),
('99999999-9999-9999-9999-999999999993', '88888888-8888-8888-8888-888888888881', '88888888-8888-8888-8888-888888888883', 'VALIDATED_BY', 0.85, TRUE);
