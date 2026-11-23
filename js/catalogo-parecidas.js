// Gestión → Catálogo (22-nov-2026): prendas parecidas de distintos proveedores y su costo por pieza.
// JP: «que sean como prendas casi iguales pero de diferente proveedor para ver precio y qué le ofrezco al cliente…
// si me pide playera, filtro a playera y que me salgan las de todos los proveedores y ya cotizarle la que más le
// convenga». Cada SKU va en un grupo; para mover una prenda de grupo basta con cambiarla de lista aquí.
// Los costos vienen de «precios-config» (privado, solo equipo) y nunca se guardan en este archivo.
(g=>{
'use strict';
const GRUPOS={
 'Playera básica de algodón':['ZN-PL-001','ZN-PL-002','ZN-PL-003','ZN-PL-004','ZN-PL-005','ZN-PL-012','ZN-PL-013','ZN-PL-014','ZN-PL-015','ZN-PL-019','ZN-PL-024','ZN-PL-025','ZN-PL-064','ZN-PL-067','ZN-PL-091','ZN-PL-124','ZN-PL-125','ZN-PL-135','ZN-PL-136','ZN-PL-137','ZN-PL-138','ZN-PL-139','ZN-PL-140','ZN-PL-141','ZN-PL-142','ZN-PL-145','ZN-PL-146','ZN-PL-149','ZN-PL-150','ZN-PL-151','ZN-PL-152','ZN-PL-153','ZN-PL-156','ZN-PL-157','ZN-PL-166','ZN-PL-168','ZN-PL-170','ZN-PL-171','ZN-PL-174','ZN-PL-177','ZN-PL-178','ZN-PL-180','ZN-PL-181','ZN-PL-182','ZN-PL-184','ZN-PL-185','ZN-PL-188','ZN-PL-192','ZN-PL-195','ZN-PL-197','ZN-PL-198','ZN-PL-199','ZN-PL-200','ZN-PL-202'],
 'Playera de algodón-poliéster':['ZN-PL-016','ZN-PL-017','ZN-PL-029','ZN-PL-032','ZN-PL-037','ZN-PL-039','ZN-PL-040','ZN-PL-041','ZN-PL-043','ZN-PL-046','ZN-PL-048','ZN-PL-049','ZN-PL-051','ZN-PL-056','ZN-PL-058','ZN-PL-075','ZN-PL-077','ZN-PL-078','ZN-PL-079','ZN-PL-080','ZN-PL-084','ZN-PL-085','ZN-PL-086','ZN-PL-087','ZN-PL-088','ZN-PL-089','ZN-PL-090','ZN-PL-092','ZN-PL-093','ZN-PL-094','ZN-PL-095','ZN-PL-097','ZN-PL-098','ZN-PL-100','ZN-PL-101','ZN-PL-103','ZN-PL-104','ZN-PL-107','ZN-PL-108','ZN-PL-112','ZN-PL-113','ZN-PL-115','ZN-PL-116','ZN-PL-121','ZN-PL-122','ZN-PL-154','ZN-PL-155','ZN-PL-160','ZN-PL-161','ZN-PL-175'],
 'Playera oversize':['ZN-PL-018','ZN-PL-033','ZN-PL-034','ZN-PL-035','ZN-PL-063','ZN-PL-066'],
 'Playera cuello V':['ZN-PL-020','ZN-PL-026','ZN-PL-030','ZN-PL-073','ZN-PL-074','ZN-PL-082','ZN-PL-083','ZN-PL-162','ZN-PL-163','ZN-PL-169','ZN-PL-173','ZN-PL-183','ZN-PL-193','ZN-PL-194','ZN-PL-203'],
 'Playera manga larga':['ZN-PL-010','ZN-PL-011','ZN-PL-021','ZN-PL-022','ZN-PL-027','ZN-PL-031','ZN-PL-038','ZN-PL-042','ZN-PL-044','ZN-PL-045','ZN-PL-047','ZN-PL-050','ZN-PL-052','ZN-PL-053','ZN-PL-055','ZN-PL-057','ZN-PL-061','ZN-PL-065','ZN-PL-071','ZN-PL-076','ZN-PL-081','ZN-PL-096','ZN-PL-099','ZN-PL-102','ZN-PL-105','ZN-PL-106','ZN-PL-109','ZN-PL-110','ZN-PL-111','ZN-PL-114','ZN-PL-117','ZN-PL-118','ZN-PL-119','ZN-PL-120','ZN-PL-123','ZN-PL-126','ZN-PL-127','ZN-PL-128','ZN-PL-129','ZN-PL-130','ZN-PL-131','ZN-PL-132','ZN-PL-133','ZN-PL-134','ZN-PL-143','ZN-PL-144','ZN-PL-147','ZN-PL-148','ZN-PL-158','ZN-PL-159','ZN-PL-165','ZN-PL-172','ZN-PL-176','ZN-PL-187','ZN-PL-191','ZN-PL-196','ZN-PL-201'],
 'Playera sin mangas':['ZN-PL-023','ZN-PL-028','ZN-PL-069','ZN-PL-070','ZN-PL-072','ZN-PL-164','ZN-PL-167','ZN-PL-179','ZN-PL-186','ZN-PL-189'],
 'Playera deportiva':['ZN-PL-006','ZN-PL-007','ZN-PL-008','ZN-PL-009','ZN-PL-036','ZN-DE-001','ZN-DE-004','ZN-DE-005','ZN-DE-006','ZN-PL-054','ZN-PL-059','ZN-PL-060','ZN-PL-062','ZN-PL-068','ZN-DE-013','ZN-PL-190'],
 'Playera deportiva manga larga':['ZN-DE-002','ZN-DE-003','ZN-DE-010','ZN-DE-011','ZN-DE-012'],
 'Jersey deportivo':['ZN-DE-007','ZN-DE-008','ZN-DE-009'],
 'Polo de algodón o 50/50':['ZN-PO-001','ZN-PO-002','ZN-PO-003','ZN-PO-008','ZN-PO-009','ZN-PO-014','ZN-PO-015','ZN-PO-016','ZN-PO-018','ZN-PO-019','ZN-PO-039','ZN-PO-040','ZN-PO-053','ZN-PO-054','ZN-PO-055','ZN-PO-056','ZN-PO-057','ZN-PO-058','ZN-PO-059'],
 'Polo deportivo':['ZN-PO-004','ZN-PO-005','ZN-PO-010','ZN-PO-011','ZN-PO-020','ZN-PO-021','ZN-PO-022','ZN-PO-023','ZN-PO-024','ZN-PO-025','ZN-PO-026','ZN-PO-027','ZN-PO-028','ZN-PO-029','ZN-PO-030','ZN-PO-031','ZN-PO-032','ZN-PO-033','ZN-PO-034','ZN-PO-035','ZN-PO-036','ZN-PO-037','ZN-PO-038','ZN-PO-041','ZN-PO-042','ZN-PO-043','ZN-PO-044','ZN-PO-045','ZN-PO-046','ZN-PO-047','ZN-PO-048','ZN-PO-049','ZN-PO-050','ZN-PO-051','ZN-PO-052','ZN-PO-060','ZN-PO-061'],
 'Polo manga larga':['ZN-PO-006','ZN-PO-007','ZN-PO-012','ZN-PO-013','ZN-PO-017'],
 'Camisa Oxford':['ZN-CM-001','ZN-CM-002','ZN-CM-003','ZN-CM-008','ZN-CM-009','ZN-CM-012','ZN-CM-013','ZN-CM-014','ZN-CM-015','ZN-CM-037','ZN-CM-038','ZN-CM-039','ZN-CM-040','ZN-CM-067','ZN-CM-068','ZN-CM-112','ZN-CM-113','ZN-CM-114','ZN-CM-115','ZN-CM-116','ZN-CM-117','ZN-CM-118','ZN-CM-119','ZN-CM-120','ZN-CM-172','ZN-CM-173','ZN-CM-174','ZN-CM-175'],
 'Camisa de gabardina':['ZN-CM-004','ZN-CM-005','ZN-CM-006','ZN-CM-007','ZN-CM-018','ZN-CM-021','ZN-CM-022','ZN-CM-023','ZN-CM-024','ZN-CM-028','ZN-CM-031','ZN-CM-032','ZN-CM-041','ZN-CM-042','ZN-CM-045','ZN-CM-046','ZN-CM-047','ZN-CM-048','ZN-CM-049','ZN-CM-050','ZN-CM-091','ZN-CM-106','ZN-CM-107','ZN-CM-108','ZN-CM-109','ZN-CM-121','ZN-CM-122','ZN-CM-123','ZN-CM-124','ZN-CM-149','ZN-CM-150','ZN-CM-151','ZN-CM-152','ZN-CM-153','ZN-CM-154','ZN-CM-155','ZN-CM-156','ZN-CM-157','ZN-CM-168','ZN-CM-169','ZN-CM-170','ZN-CM-171'],
 'Camisa de mezclilla':['ZN-CM-010','ZN-CM-011','ZN-CM-025','ZN-CM-053','ZN-CM-110','ZN-CM-111','ZN-CM-134','ZN-CM-135','ZN-CM-136','ZN-CM-159','ZN-CM-164','ZN-CM-165','ZN-CM-166','ZN-CM-167','ZN-CM-231','ZN-CM-232'],
 'Camisa de cuadros':['ZN-CM-019','ZN-CM-065','ZN-CM-066','ZN-CM-100','ZN-CM-101','ZN-CM-102','ZN-CM-103','ZN-CM-127','ZN-CM-128','ZN-CM-131','ZN-CM-223','ZN-CM-224'],
 'Camisa de pesca o utilitaria':['ZN-CM-016','ZN-CM-017','ZN-CM-020','ZN-CM-026','ZN-CM-027','ZN-CM-029','ZN-CM-030','ZN-CM-033','ZN-CM-034','ZN-CM-035','ZN-CM-036','ZN-CM-043','ZN-CM-044','ZN-CM-051','ZN-CM-052','ZN-CM-054','ZN-CM-055','ZN-CM-056','ZN-CM-057','ZN-CM-058','ZN-CM-059','ZN-CM-060','ZN-CM-061','ZN-CM-062','ZN-CM-063','ZN-CM-064','ZN-CM-069','ZN-CM-070','ZN-CM-071','ZN-CM-072','ZN-CM-073','ZN-CM-074','ZN-CM-075','ZN-CM-076','ZN-CM-077','ZN-CM-078','ZN-CM-079','ZN-CM-080','ZN-CM-081','ZN-CM-082','ZN-CM-083','ZN-CM-084','ZN-CM-085','ZN-CM-086','ZN-CM-087','ZN-CM-088','ZN-CM-089','ZN-CM-090','ZN-CM-092','ZN-CM-093','ZN-CM-094','ZN-CM-095','ZN-CM-096','ZN-CM-097','ZN-CM-098','ZN-CM-099','ZN-CM-104','ZN-CM-105','ZN-CM-125','ZN-CM-126','ZN-CM-129','ZN-CM-130','ZN-CM-132','ZN-CM-133','ZN-CM-137','ZN-CM-138','ZN-CM-139','ZN-CM-140','ZN-CM-141','ZN-CM-142','ZN-CM-143','ZN-CM-144','ZN-CM-145','ZN-CM-146','ZN-CM-147','ZN-CM-148','ZN-CM-158','ZN-CM-160','ZN-CM-161','ZN-CM-162','ZN-CM-163','ZN-CM-176','ZN-CM-177','ZN-CM-178','ZN-CM-179','ZN-CM-180','ZN-CM-181','ZN-CM-182','ZN-CM-183','ZN-CM-184','ZN-CM-185','ZN-CM-186','ZN-CM-187','ZN-CM-188','ZN-CM-189','ZN-CM-190','ZN-CM-191','ZN-CM-192','ZN-CM-193','ZN-CM-194','ZN-CM-195','ZN-CM-196','ZN-CM-197','ZN-CM-198','ZN-CM-199','ZN-CM-200','ZN-CM-201','ZN-CM-202','ZN-CM-203','ZN-CM-204','ZN-CM-205','ZN-CM-206','ZN-CM-207','ZN-CM-208','ZN-CM-209','ZN-CM-210','ZN-CM-211','ZN-CM-212','ZN-CM-213','ZN-CM-214','ZN-CM-215','ZN-CM-216','ZN-CM-217','ZN-CM-218','ZN-CM-219','ZN-CM-220','ZN-CM-221','ZN-CM-222','ZN-CM-225','ZN-CM-226','ZN-CM-227','ZN-CM-228','ZN-CM-229','ZN-CM-230','ZN-CM-233','ZN-CM-234','ZN-CM-235','ZN-CM-236','ZN-CM-237','ZN-CM-238','ZN-CM-239','ZN-CM-240','ZN-CM-241','ZN-CM-242','ZN-CM-243'],
 'Sudadera cuello redondo':['ZN-SU-005','ZN-SU-007','ZN-SU-013','ZN-SU-024','ZN-SU-028','ZN-SU-032','ZN-SU-034','ZN-SU-035','ZN-SU-036','ZN-SU-037','ZN-SU-039','ZN-SU-041','ZN-SU-043','ZN-SU-046'],
 'Sudadera con capucha':['ZN-SU-001','ZN-SU-003','ZN-SU-006','ZN-SU-009','ZN-SU-011','ZN-SU-012','ZN-SU-014','ZN-SU-018','ZN-SU-019','ZN-SU-020','ZN-SU-021','ZN-SU-022','ZN-SU-023','ZN-SU-025','ZN-SU-029','ZN-SU-030','ZN-SU-033','ZN-SU-042','ZN-SU-044','ZN-SU-045','ZN-SU-047'],
 'Sudadera con cierre':['ZN-SU-002','ZN-SU-004','ZN-SU-008','ZN-SU-010','ZN-SU-015','ZN-SU-016','ZN-SU-017','ZN-SU-026','ZN-SU-027','ZN-SU-031','ZN-SU-038','ZN-SU-040','ZN-SU-048'],
 'Chamarra softshell':['ZN-CH-001','ZN-CH-002','ZN-CH-004','ZN-CH-022','ZN-CH-030','ZN-CH-035'],
 'Rompevientos':['ZN-CH-003','ZN-CH-007','ZN-CH-008','ZN-CH-012','ZN-CH-036','ZN-CH-037'],
 'Chamarra acolchada':['ZN-CH-005','ZN-CH-014','ZN-CH-018'],
 'Chamarra universitaria':['ZN-CH-006'],
 'Chaleco softshell':['ZN-CE-001','ZN-CH-009','ZN-CE-004'],
 'Chaleco acolchado':['ZN-CE-002','ZN-CH-010'],
 'Pants deportivo':['ZN-PA-001','ZN-PA-118','ZN-PA-119','ZN-PA-120','ZN-PA-140','ZN-PA-145'],
 'Pantalón de mezclilla':['ZN-PA-002','ZN-PA-025','ZN-PA-026','ZN-PA-027','ZN-PA-028','ZN-PA-029','ZN-PA-030','ZN-PA-031','ZN-PA-032','ZN-PA-033','ZN-PA-034','ZN-PA-035','ZN-PA-036','ZN-PA-037','ZN-PA-038','ZN-PA-046','ZN-PA-049','ZN-PA-050','ZN-PA-055','ZN-PA-062','ZN-PA-070','ZN-PA-071','ZN-PA-072','ZN-PA-073','ZN-PA-074','ZN-PA-080','ZN-PA-103','ZN-PA-104','ZN-PA-125','ZN-PA-126','ZN-PA-128','ZN-PA-129','ZN-PA-130','ZN-PA-131','ZN-PA-142'],
 'Pantalón stretch':['ZN-PA-003','ZN-PA-006','ZN-PA-042','ZN-PA-043','ZN-PA-044','ZN-PA-045','ZN-PA-047','ZN-PA-048','ZN-PA-051','ZN-PA-060','ZN-PA-061','ZN-PA-078','ZN-PA-081','ZN-PA-083','ZN-PA-085','ZN-PA-086','ZN-PA-097','ZN-PA-099','ZN-PA-100','ZN-PA-102','ZN-PA-105','ZN-PA-106','ZN-PA-110','ZN-PA-111','ZN-PA-112','ZN-PA-113','ZN-PA-114','ZN-PA-121','ZN-PA-122','ZN-PA-135','ZN-PA-136','ZN-PA-137','ZN-PA-138','ZN-PA-139'],
 'Playera infantil de algodón':['ZN-IN-001','ZN-IN-005','ZN-IN-006','ZN-IN-011','ZN-IN-013','ZN-IN-014','ZN-IN-015','ZN-IN-016','ZN-IN-017','ZN-IN-019','ZN-IN-020','ZN-IN-021','ZN-IN-022','ZN-IN-024','ZN-IN-025','ZN-IN-026','ZN-IN-029','ZN-IN-030'],
 'Playera infantil deportiva':['ZN-IN-004','ZN-IN-007','ZN-IN-008','ZN-IN-027'],
 'Polo infantil':['ZN-IN-003','ZN-IN-009','ZN-IN-012','ZN-IN-023','ZN-IN-031','ZN-IN-032','ZN-IN-036','ZN-IN-037','ZN-IN-038'],
 'Sudadera infantil':['ZN-IN-002','ZN-IN-010','ZN-IN-018','ZN-IN-028','ZN-IN-033','ZN-IN-034','ZN-IN-035'],
 'Gorra clásica':['ZN-GO-001','ZN-GO-002','ZN-GO-003','ZN-GO-005','ZN-GO-023','ZN-GO-025','ZN-GO-032','ZN-GO-033','ZN-GO-034','ZN-GO-035','ZN-GO-039','ZN-GO-040','ZN-GO-041','ZN-GO-043','ZN-GO-044','ZN-GO-045','ZN-GO-046','ZN-GO-047','ZN-GO-050','ZN-GO-051','ZN-GO-052','ZN-GO-053','ZN-GO-054','ZN-GO-055','ZN-GO-056','ZN-GO-057','ZN-GO-058','ZN-GO-059','ZN-GO-060','ZN-GO-061','ZN-GO-064','ZN-GO-065','ZN-GO-072','ZN-GO-074','ZN-GO-075','ZN-GO-076','ZN-GO-077','ZN-GO-082','ZN-GO-083','ZN-GO-084','ZN-GO-085','ZN-GO-087','ZN-GO-091','ZN-GO-092','ZN-GO-093','ZN-GO-094','ZN-GO-095','ZN-GO-096','ZN-GO-098','ZN-GO-100'],
 'Gorra trucker':['ZN-GO-004','ZN-GO-006','ZN-GO-008','ZN-GO-009','ZN-GO-014','ZN-GO-015','ZN-GO-016','ZN-GO-017','ZN-GO-018','ZN-GO-019','ZN-GO-020','ZN-GO-021','ZN-GO-022','ZN-GO-024','ZN-GO-036','ZN-GO-037','ZN-GO-038','ZN-GO-049','ZN-GO-062','ZN-GO-067','ZN-GO-068','ZN-GO-069','ZN-GO-070','ZN-GO-078','ZN-GO-080','ZN-GO-081','ZN-GO-101','ZN-GO-102'],
 'Gorra deportiva':['ZN-GO-007','ZN-GO-010','ZN-GO-011','ZN-GO-012','ZN-GO-013','ZN-GO-031','ZN-GO-042','ZN-GO-071','ZN-GO-079','ZN-GO-086','ZN-GO-088','ZN-GO-089','ZN-GO-099'],
 'Gorra outdoor':['ZN-GO-026','ZN-GO-028','ZN-GO-030','ZN-GO-073'],
 'Sombrero':['ZN-GO-027','ZN-GO-029','ZN-GO-063','ZN-GO-090'],
 'Visera':['ZN-GO-048','ZN-GO-066','ZN-GO-097'],
 'Otros':['ZN-OT-001','ZN-OT-002','ZN-OT-003','ZN-OT-004','ZN-OT-005','ZN-OT-006','ZN-OT-007','ZN-OT-008','ZN-OT-009','ZN-OT-010','ZN-OT-011','ZN-OT-012','ZN-OT-013','ZN-OT-014','ZN-OT-015','ZN-OT-016','ZN-OT-017','ZN-OT-018','ZN-OT-019','ZN-OT-020','ZN-OT-021','ZN-OT-022','ZN-OT-023','ZN-OT-024','ZN-OT-025','ZN-OT-026','ZN-OT-027','ZN-OT-028','ZN-OT-029','ZN-OT-030','ZN-OT-031','ZN-OT-032','ZN-OT-033','ZN-OT-034','ZN-OT-035','ZN-OT-036','ZN-OT-037','ZN-OT-038','ZN-OT-039','ZN-OT-040','ZN-OT-041','ZN-OT-042','ZN-OT-043','ZN-OT-044','ZN-OT-045','ZN-OT-046','ZN-OT-047','ZN-OT-048','ZN-OT-049','ZN-OT-050','ZN-OT-051','ZN-OT-052','ZN-OT-053','ZN-OT-054','ZN-OT-055','ZN-OT-056','ZN-OT-057','ZN-OT-058','ZN-OT-059','ZN-OT-060','ZN-OT-061','ZN-OT-062'],
 'Botella térmica':['ZN-TV-001','ZN-TV-002','ZN-TV-003','ZN-TV-006'],
 'Vaso o taza térmica':['ZN-TV-004','ZN-TV-005'],
 'Pantalón de trabajo':['ZN-PA-004','ZN-PA-005','ZN-PA-007','ZN-PA-008','ZN-PA-009','ZN-PA-010','ZN-PA-011','ZN-PA-012','ZN-PA-013','ZN-PA-014','ZN-PA-015','ZN-PA-016','ZN-PA-017','ZN-PA-018','ZN-PA-019','ZN-PA-020','ZN-PA-039','ZN-PA-040','ZN-PA-041','ZN-PA-052','ZN-PA-053','ZN-PA-054','ZN-PA-058','ZN-PA-059','ZN-PA-063','ZN-PA-064','ZN-PA-066','ZN-PA-067','ZN-PA-068','ZN-PA-069','ZN-PA-075','ZN-PA-076','ZN-PA-077','ZN-PA-079','ZN-PA-082','ZN-PA-084','ZN-PA-087','ZN-PA-098','ZN-PA-101','ZN-PA-107','ZN-PA-109','ZN-PA-115','ZN-PA-116','ZN-PA-117','ZN-PA-127','ZN-PA-132','ZN-PA-133','ZN-PA-134','ZN-PA-141','ZN-PA-143','ZN-PA-144'],
 'Short':['ZN-PA-021','ZN-PA-022','ZN-PA-023','ZN-PA-024','ZN-PA-056','ZN-PA-057','ZN-PA-065','ZN-PA-088','ZN-PA-089','ZN-PA-090','ZN-PA-091','ZN-PA-092','ZN-PA-093','ZN-PA-094','ZN-PA-095','ZN-PA-096','ZN-PA-108','ZN-PA-123','ZN-PA-124'],
 'Overol':['ZN-OV-001','ZN-OV-002','ZN-OV-003','ZN-OV-004','ZN-OV-005','ZN-OV-006','ZN-OV-007','ZN-OV-008','ZN-OV-009','ZN-OV-010','ZN-OV-011','ZN-OV-012','ZN-OV-013','ZN-OV-014','ZN-OV-015','ZN-OV-016','ZN-OV-017','ZN-OV-018','ZN-OV-019','ZN-OV-020','ZN-OV-021','ZN-OV-022','ZN-OV-023','ZN-OV-024'],
 'Mandil':['ZN-MA-001','ZN-MA-002','ZN-MA-003','ZN-MA-004','ZN-MA-005','ZN-MA-006','ZN-MA-007','ZN-MA-008','ZN-MA-009','ZN-MA-010','ZN-MA-011'],
 'Chamarra de trabajo':['ZN-CH-011','ZN-CH-013','ZN-CH-015','ZN-CH-016','ZN-CH-017','ZN-CH-019','ZN-CH-020','ZN-CH-021','ZN-CH-023','ZN-CH-024','ZN-CH-025','ZN-CH-026','ZN-CH-027','ZN-CH-028','ZN-CH-029','ZN-CH-031','ZN-CH-032','ZN-CH-033','ZN-CH-034','ZN-CH-038','ZN-CH-039'],
 'Chaleco de trabajo':['ZN-CE-003','ZN-CE-005','ZN-CE-006','ZN-CE-007','ZN-CE-008','ZN-CE-009','ZN-CE-010','ZN-CE-011','ZN-CE-012'],
 'Bata':['ZN-BA-001','ZN-BA-002','ZN-BA-003','ZN-BA-004','ZN-BA-005','ZN-BA-006','ZN-BA-007','ZN-BA-008','ZN-BA-009','ZN-BA-010','ZN-BA-011','ZN-BA-012','ZN-BA-013','ZN-BA-014','ZN-BA-015','ZN-BA-016','ZN-BA-017','ZN-BA-018','ZN-BA-019','ZN-BA-020','ZN-BA-021','ZN-BA-022','ZN-BA-023','ZN-BA-024','ZN-BA-025','ZN-BA-026','ZN-BA-027','ZN-BA-028','ZN-BA-029','ZN-BA-030','ZN-BA-031','ZN-BA-032','ZN-BA-033','ZN-BA-034','ZN-BA-035','ZN-BA-036'],
 'Filipina':['ZN-FI-001','ZN-FI-002','ZN-FI-003','ZN-FI-004','ZN-FI-005','ZN-FI-006','ZN-FI-007','ZN-FI-008','ZN-FI-009','ZN-FI-010','ZN-FI-011','ZN-FI-012','ZN-FI-013','ZN-FI-014','ZN-FI-015','ZN-FI-016','ZN-FI-017','ZN-FI-018','ZN-FI-019','ZN-FI-020','ZN-FI-021','ZN-FI-022','ZN-FI-023','ZN-FI-024','ZN-FI-025','ZN-FI-026','ZN-FI-027']
};
const ORDEN=Object.keys(GRUPOS),POR_SKU=new Map();
for(const [grupo,skus] of Object.entries(GRUPOS))for(const sku of skus)POR_SKU.set(sku,grupo);
// Una prenda nueva sin grupo se queda con el nombre de su categoría (por ejemplo «Bolsas»).
const grupoDe=p=>POR_SKU.get(p?.sku)||p?.categoria||'Otras';
const ordenGrupo=grupo=>{const i=ORDEN.indexOf(grupo);return i<0?ORDEN.length:i;};
const vale=(b,n)=>b&&b.costo!=null&&n>=(b.desdePiezas??1)&&(b.hastaPiezas==null||n<=b.hastaPiezas);
// Costo por pieza (centavos) para n piezas: el de la talla más barata (S a XL), más «otros». null si no hay costo.
function costoPara(c,n){
 if(!c)return null;const otros=Number(c.otros)||0;
 if(Array.isArray(c.bandas)&&c.bandas.length){const v=c.bandas.filter(b=>vale(b,n)).map(b=>b.costo);return v.length?Math.min(...v)+otros:null;}
 return c.prenda==null?null:c.prenda+otros;
}
// Tramos de cantidad para la ficha: [{desde,hasta,costo (talla más barata),mayor (talla más cara)}]. Corta en cada
// inicio y fin de banda, así que funciona aunque las tallas tengan tramos distintos; los huecos no salen.
function tramos(c){
 if(!c)return [];const otros=Number(c.otros)||0;
 if(!Array.isArray(c.bandas)||!c.bandas.length)return c.prenda==null?[]:[{desde:1,hasta:null,costo:c.prenda+otros,mayor:c.prenda+otros}];
 const bs=c.bandas.filter(b=>b.costo!=null),cortes=[...new Set(bs.flatMap(b=>[b.desdePiezas??1,...(b.hastaPiezas==null?[]:[b.hastaPiezas+1])]))].sort((a,b)=>a-b),out=[];
 cortes.forEach((a,i)=>{
  const fin=i+1<cortes.length?cortes[i+1]-1:null,v=bs.filter(b=>vale(b,a)).map(b=>b.costo+otros);if(!v.length)return;
  const t={desde:a,hasta:fin,costo:Math.min(...v),mayor:Math.max(...v)},u=out.at(-1);
  if(u&&u.hasta===a-1&&u.costo===t.costo&&u.mayor===t.mayor)u.hasta=fin;else out.push(t);
 });
 return out;
}
g.ZAINParecidas={GRUPOS,grupoDe,ordenGrupo,costoPara,tramos};
})(typeof window!=='undefined'?window:globalThis);
