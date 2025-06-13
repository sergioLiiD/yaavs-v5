"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcrypt_1 = require("bcrypt");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var adminRole, permisos, _i, permisos_1, permiso, _a, permisos_2, permiso, permisoCreado, passwordHash, adminUser, usuarioVerificado, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 15, 16, 18]);
                    console.log('Iniciando creación del administrador...');
                    return [4 /*yield*/, prisma.rol.upsert({
                            where: { nombre: 'ADMINISTRADOR' },
                            update: {},
                            create: {
                                nombre: 'ADMINISTRADOR',
                                descripcion: 'Rol con acceso total al sistema'
                            }
                        })];
                case 1:
                    adminRole = _b.sent();
                    console.log('✅ Rol ADMINISTRADOR creado/verificado');
                    permisos = [
                        {
                            codigo: 'USERS_VIEW',
                            nombre: 'Ver Usuarios',
                            descripcion: 'Permite ver la lista de usuarios',
                            categoria: 'USERS'
                        },
                        {
                            codigo: 'USERS_CREATE',
                            nombre: 'Crear Usuarios',
                            descripcion: 'Permite crear nuevos usuarios',
                            categoria: 'USERS'
                        },
                        {
                            codigo: 'USERS_EDIT',
                            nombre: 'Editar Usuarios',
                            descripcion: 'Permite editar usuarios existentes',
                            categoria: 'USERS'
                        },
                        {
                            codigo: 'USERS_DELETE',
                            nombre: 'Eliminar Usuarios',
                            descripcion: 'Permite eliminar usuarios',
                            categoria: 'USERS'
                        },
                        {
                            codigo: 'ROLES_VIEW',
                            nombre: 'Ver Roles',
                            descripcion: 'Permite ver la lista de roles',
                            categoria: 'ROLES'
                        },
                        {
                            codigo: 'ROLES_CREATE',
                            nombre: 'Crear Roles',
                            descripcion: 'Permite crear nuevos roles',
                            categoria: 'ROLES'
                        },
                        {
                            codigo: 'ROLES_EDIT',
                            nombre: 'Editar Roles',
                            descripcion: 'Permite editar roles existentes',
                            categoria: 'ROLES'
                        },
                        {
                            codigo: 'ROLES_DELETE',
                            nombre: 'Eliminar Roles',
                            descripcion: 'Permite eliminar roles',
                            categoria: 'ROLES'
                        }
                    ];
                    _i = 0, permisos_1 = permisos;
                    _b.label = 2;
                case 2:
                    if (!(_i < permisos_1.length)) return [3 /*break*/, 5];
                    permiso = permisos_1[_i];
                    return [4 /*yield*/, prisma.permiso.upsert({
                            where: { codigo: permiso.codigo },
                            update: {},
                            create: permiso
                        })];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log('✅ Permisos básicos creados/verificados');
                    _a = 0, permisos_2 = permisos;
                    _b.label = 6;
                case 6:
                    if (!(_a < permisos_2.length)) return [3 /*break*/, 10];
                    permiso = permisos_2[_a];
                    return [4 /*yield*/, prisma.permiso.findUnique({
                            where: { codigo: permiso.codigo }
                        })];
                case 7:
                    permisoCreado = _b.sent();
                    if (!permisoCreado) return [3 /*break*/, 9];
                    return [4 /*yield*/, prisma.rolPermiso.upsert({
                            where: {
                                rolId_permisoId: {
                                    rolId: adminRole.id,
                                    permisoId: permisoCreado.id
                                }
                            },
                            update: {},
                            create: {
                                rolId: adminRole.id,
                                permisoId: permisoCreado.id
                            }
                        })];
                case 8:
                    _b.sent();
                    _b.label = 9;
                case 9:
                    _a++;
                    return [3 /*break*/, 6];
                case 10:
                    console.log('✅ Permisos asignados al rol ADMINISTRADOR');
                    return [4 /*yield*/, (0, bcrypt_1.hash)('whoS5un0%', 10)];
                case 11:
                    passwordHash = _b.sent();
                    return [4 /*yield*/, prisma.usuario.upsert({
                            where: { email: 'sergio@hoom.mx' },
                            update: {
                                nombre: 'Sergio',
                                apellidoPaterno: 'Velazco',
                                passwordHash: passwordHash,
                                activo: true
                            },
                            create: {
                                email: 'sergio@hoom.mx',
                                nombre: 'Sergio',
                                apellidoPaterno: 'Velazco',
                                passwordHash: passwordHash,
                                activo: true
                            }
                        })];
                case 12:
                    adminUser = _b.sent();
                    console.log('✅ Usuario administrador creado/actualizado');
                    // 5. Asignar el rol ADMINISTRADOR al usuario
                    return [4 /*yield*/, prisma.usuarioRol.upsert({
                            where: {
                                usuarioId_rolId: {
                                    usuarioId: adminUser.id,
                                    rolId: adminRole.id
                                }
                            },
                            update: {},
                            create: {
                                usuarioId: adminUser.id,
                                rolId: adminRole.id
                            }
                        })];
                case 13:
                    // 5. Asignar el rol ADMINISTRADOR al usuario
                    _b.sent();
                    console.log('✅ Rol ADMINISTRADOR asignado al usuario');
                    return [4 /*yield*/, prisma.usuario.findUnique({
                            where: { email: 'sergio@hoom.mx' },
                            include: {
                                usuarioRoles: {
                                    include: {
                                        rol: {
                                            include: {
                                                permisos: {
                                                    include: {
                                                        permiso: true
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        })];
                case 14:
                    usuarioVerificado = _b.sent();
                    if (usuarioVerificado) {
                        console.log('\n🎉 Proceso completado exitosamente!');
                        console.log('\nCredenciales de acceso:');
                        console.log('Email: sergio@hoom.mx');
                        console.log('Contraseña: whoS5un0%');
                        console.log('\nRoles asignados:');
                        usuarioVerificado.usuarioRoles.forEach(function (ur) {
                            console.log("- ".concat(ur.rol.nombre));
                            console.log('  Permisos:');
                            ur.rol.permisos.forEach(function (rp) {
                                console.log("  - ".concat(rp.permiso.nombre, " (").concat(rp.permiso.codigo, ")"));
                            });
                        });
                    }
                    return [3 /*break*/, 18];
                case 15:
                    error_1 = _b.sent();
                    console.error('❌ Error durante la inicialización:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 18];
                case 16: return [4 /*yield*/, prisma.$disconnect()];
                case 17:
                    _b.sent();
                    return [7 /*endfinally*/];
                case 18: return [2 /*return*/];
            }
        });
    });
}
main();
