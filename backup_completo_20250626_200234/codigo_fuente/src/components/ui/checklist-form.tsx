import { Label } from "@/components/ui/label"

interface ChecklistItem {
  enciende: "yes" | "no" | null;
  pantalla: "yes" | "no" | null;
  botonInicio: "yes" | "no" | null;
  botonesVolumen: "yes" | "no" | null;
  camara: "yes" | "no" | null;
  microfono: "yes" | "no" | null;
  altavoz: "yes" | "no" | null;
  wifi: "yes" | "no" | null;
  bluetooth: "yes" | "no" | null;
  gps: "yes" | "no" | null;
}

interface ChecklistFormProps {
  title: string;
  checklist: ChecklistItem;
  onChange: (field: keyof ChecklistItem, value: "yes" | "no" | null) => void;
  idPrefix: string;
}

export function ChecklistForm({ title, checklist, onChange, idPrefix }: ChecklistFormProps) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Label className="text-sm font-medium text-gray-700">¿El dispositivo enciende correctamente?</Label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${idPrefix}-enciende-yes`}
                name={`${idPrefix}-enciende`}
                value="yes"
                checked={checklist.enciende === "yes"}
                onChange={() => onChange("enciende", "yes")}
                className="h-4 w-4 text-[#FEBF19] focus:ring-[#FEBF19] border-gray-300"
              />
              <Label htmlFor={`${idPrefix}-enciende-yes`} className="text-sm font-medium text-gray-700">
                Sí
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${idPrefix}-enciende-no`}
                name={`${idPrefix}-enciende`}
                value="no"
                checked={checklist.enciende === "no"}
                onChange={() => onChange("enciende", "no")}
                className="h-4 w-4 text-[#FEBF19] focus:ring-[#FEBF19] border-gray-300"
              />
              <Label htmlFor={`${idPrefix}-enciende-no`} className="text-sm font-medium text-gray-700">
                No
              </Label>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Label className="text-sm font-medium text-gray-700">¿La pantalla funciona correctamente?</Label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${idPrefix}-pantalla-yes`}
                name={`${idPrefix}-pantalla`}
                value="yes"
                checked={checklist.pantalla === "yes"}
                onChange={() => onChange("pantalla", "yes")}
                className="h-4 w-4 text-[#FEBF19] focus:ring-[#FEBF19] border-gray-300"
              />
              <Label htmlFor={`${idPrefix}-pantalla-yes`} className="text-sm font-medium text-gray-700">
                Sí
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${idPrefix}-pantalla-no`}
                name={`${idPrefix}-pantalla`}
                value="no"
                checked={checklist.pantalla === "no"}
                onChange={() => onChange("pantalla", "no")}
                className="h-4 w-4 text-[#FEBF19] focus:ring-[#FEBF19] border-gray-300"
              />
              <Label htmlFor={`${idPrefix}-pantalla-no`} className="text-sm font-medium text-gray-700">
                No
              </Label>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Label className="text-sm font-medium text-gray-700">¿El botón de inicio funciona?</Label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${idPrefix}-boton-inicio-yes`}
                name={`${idPrefix}-boton-inicio`}
                value="yes"
                checked={checklist.botonInicio === "yes"}
                onChange={() => onChange("botonInicio", "yes")}
                className="h-4 w-4 text-[#FEBF19] focus:ring-[#FEBF19] border-gray-300"
              />
              <Label htmlFor={`${idPrefix}-boton-inicio-yes`} className="text-sm font-medium text-gray-700">
                Sí
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${idPrefix}-boton-inicio-no`}
                name={`${idPrefix}-boton-inicio`}
                value="no"
                checked={checklist.botonInicio === "no"}
                onChange={() => onChange("botonInicio", "no")}
                className="h-4 w-4 text-[#FEBF19] focus:ring-[#FEBF19] border-gray-300"
              />
              <Label htmlFor={`${idPrefix}-boton-inicio-no`} className="text-sm font-medium text-gray-700">
                No
              </Label>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Label className="text-sm font-medium text-gray-700">¿Los botones de volumen funcionan?</Label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${idPrefix}-botones-volumen-yes`}
                name={`${idPrefix}-botones-volumen`}
                value="yes"
                checked={checklist.botonesVolumen === "yes"}
                onChange={() => onChange("botonesVolumen", "yes")}
                className="h-4 w-4 text-[#FEBF19] focus:ring-[#FEBF19] border-gray-300"
              />
              <Label htmlFor={`${idPrefix}-botones-volumen-yes`} className="text-sm font-medium text-gray-700">
                Sí
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${idPrefix}-botones-volumen-no`}
                name={`${idPrefix}-botones-volumen`}
                value="no"
                checked={checklist.botonesVolumen === "no"}
                onChange={() => onChange("botonesVolumen", "no")}
                className="h-4 w-4 text-[#FEBF19] focus:ring-[#FEBF19] border-gray-300"
              />
              <Label htmlFor={`${idPrefix}-botones-volumen-no`} className="text-sm font-medium text-gray-700">
                No
              </Label>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Label className="text-sm font-medium text-gray-700">¿La cámara funciona?</Label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${idPrefix}-camara-yes`}
                name={`${idPrefix}-camara`}
                value="yes"
                checked={checklist.camara === "yes"}
                onChange={() => onChange("camara", "yes")}
                className="h-4 w-4 text-[#FEBF19] focus:ring-[#FEBF19] border-gray-300"
              />
              <Label htmlFor={`${idPrefix}-camara-yes`} className="text-sm font-medium text-gray-700">
                Sí
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${idPrefix}-camara-no`}
                name={`${idPrefix}-camara`}
                value="no"
                checked={checklist.camara === "no"}
                onChange={() => onChange("camara", "no")}
                className="h-4 w-4 text-[#FEBF19] focus:ring-[#FEBF19] border-gray-300"
              />
              <Label htmlFor={`${idPrefix}-camara-no`} className="text-sm font-medium text-gray-700">
                No
              </Label>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Label className="text-sm font-medium text-gray-700">¿El micrófono funciona?</Label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${idPrefix}-microfono-yes`}
                name={`${idPrefix}-microfono`}
                value="yes"
                checked={checklist.microfono === "yes"}
                onChange={() => onChange("microfono", "yes")}
                className="h-4 w-4 text-[#FEBF19] focus:ring-[#FEBF19] border-gray-300"
              />
              <Label htmlFor={`${idPrefix}-microfono-yes`} className="text-sm font-medium text-gray-700">
                Sí
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${idPrefix}-microfono-no`}
                name={`${idPrefix}-microfono`}
                value="no"
                checked={checklist.microfono === "no"}
                onChange={() => onChange("microfono", "no")}
                className="h-4 w-4 text-[#FEBF19] focus:ring-[#FEBF19] border-gray-300"
              />
              <Label htmlFor={`${idPrefix}-microfono-no`} className="text-sm font-medium text-gray-700">
                No
              </Label>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Label className="text-sm font-medium text-gray-700">¿El altavoz funciona?</Label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${idPrefix}-altavoz-yes`}
                name={`${idPrefix}-altavoz`}
                value="yes"
                checked={checklist.altavoz === "yes"}
                onChange={() => onChange("altavoz", "yes")}
                className="h-4 w-4 text-[#FEBF19] focus:ring-[#FEBF19] border-gray-300"
              />
              <Label htmlFor={`${idPrefix}-altavoz-yes`} className="text-sm font-medium text-gray-700">
                Sí
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${idPrefix}-altavoz-no`}
                name={`${idPrefix}-altavoz`}
                value="no"
                checked={checklist.altavoz === "no"}
                onChange={() => onChange("altavoz", "no")}
                className="h-4 w-4 text-[#FEBF19] focus:ring-[#FEBF19] border-gray-300"
              />
              <Label htmlFor={`${idPrefix}-altavoz-no`} className="text-sm font-medium text-gray-700">
                No
              </Label>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Label className="text-sm font-medium text-gray-700">¿El WiFi funciona?</Label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${idPrefix}-wifi-yes`}
                name={`${idPrefix}-wifi`}
                value="yes"
                checked={checklist.wifi === "yes"}
                onChange={() => onChange("wifi", "yes")}
                className="h-4 w-4 text-[#FEBF19] focus:ring-[#FEBF19] border-gray-300"
              />
              <Label htmlFor={`${idPrefix}-wifi-yes`} className="text-sm font-medium text-gray-700">
                Sí
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${idPrefix}-wifi-no`}
                name={`${idPrefix}-wifi`}
                value="no"
                checked={checklist.wifi === "no"}
                onChange={() => onChange("wifi", "no")}
                className="h-4 w-4 text-[#FEBF19] focus:ring-[#FEBF19] border-gray-300"
              />
              <Label htmlFor={`${idPrefix}-wifi-no`} className="text-sm font-medium text-gray-700">
                No
              </Label>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Label className="text-sm font-medium text-gray-700">¿El Bluetooth funciona?</Label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${idPrefix}-bluetooth-yes`}
                name={`${idPrefix}-bluetooth`}
                value="yes"
                checked={checklist.bluetooth === "yes"}
                onChange={() => onChange("bluetooth", "yes")}
                className="h-4 w-4 text-[#FEBF19] focus:ring-[#FEBF19] border-gray-300"
              />
              <Label htmlFor={`${idPrefix}-bluetooth-yes`} className="text-sm font-medium text-gray-700">
                Sí
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${idPrefix}-bluetooth-no`}
                name={`${idPrefix}-bluetooth`}
                value="no"
                checked={checklist.bluetooth === "no"}
                onChange={() => onChange("bluetooth", "no")}
                className="h-4 w-4 text-[#FEBF19] focus:ring-[#FEBF19] border-gray-300"
              />
              <Label htmlFor={`${idPrefix}-bluetooth-no`} className="text-sm font-medium text-gray-700">
                No
              </Label>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Label className="text-sm font-medium text-gray-700">¿El GPS funciona?</Label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${idPrefix}-gps-yes`}
                name={`${idPrefix}-gps`}
                value="yes"
                checked={checklist.gps === "yes"}
                onChange={() => onChange("gps", "yes")}
                className="h-4 w-4 text-[#FEBF19] focus:ring-[#FEBF19] border-gray-300"
              />
              <Label htmlFor={`${idPrefix}-gps-yes`} className="text-sm font-medium text-gray-700">
                Sí
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${idPrefix}-gps-no`}
                name={`${idPrefix}-gps`}
                value="no"
                checked={checklist.gps === "no"}
                onChange={() => onChange("gps", "no")}
                className="h-4 w-4 text-[#FEBF19] focus:ring-[#FEBF19] border-gray-300"
              />
              <Label htmlFor={`${idPrefix}-gps-no`} className="text-sm font-medium text-gray-700">
                No
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 