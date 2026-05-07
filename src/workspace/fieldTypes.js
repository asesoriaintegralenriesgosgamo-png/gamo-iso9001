/**
 * Registry of available workspace field types.
 *
 * To add a new specialized field:
 *   1. Create a component in `fields/` exporting { Editor, Printer, defaultValue }
 *   2. Import it here and add it to FIELD_TYPES under the desired key
 *   3. Reference the key from a PHASES item via `fieldType: "your-key"`
 *
 * Future stages will register: table, structured-form, matrix-2x2, matrix,
 * risk-heatmap, ishikawa, timeline, survey-builder, org-chart, flowchart,
 * process-map, career-path.
 */

import { TextareaField } from "./fields/TextareaField.jsx";
import { TableField } from "./fields/TableField.jsx";
import { StructuredFormField } from "./fields/StructuredFormField.jsx";
import { Matrix2x2Field } from "./fields/Matrix2x2Field.jsx";
import { MatrixField } from "./fields/MatrixField.jsx";
import { RiskHeatmapField } from "./fields/RiskHeatmapField.jsx";
import { IshikawaField } from "./fields/IshikawaField.jsx";
import { TimelineField } from "./fields/TimelineField.jsx";
import { SurveyBuilderField } from "./fields/SurveyBuilderField.jsx";
import { OrgChartField } from "./fields/OrgChartField.jsx";
import { FlowchartField } from "./fields/FlowchartField.jsx";
import { ProcessMapField } from "./fields/ProcessMapField.jsx";
import { CareerPathField } from "./fields/CareerPathField.jsx";

export const FIELD_TYPES = {
  textarea: TextareaField,
  table: TableField,
  "structured-form": StructuredFormField,
  "matrix-2x2": Matrix2x2Field,
  matrix: MatrixField,
  "risk-heatmap": RiskHeatmapField,
  ishikawa: IshikawaField,
  timeline: TimelineField,
  "survey-builder": SurveyBuilderField,
  "org-chart": OrgChartField,
  flowchart: FlowchartField,
  "process-map": ProcessMapField,
  "career-path": CareerPathField,
};

export const DEFAULT_FIELD_TYPE = "textarea";

/**
 * Resolves a fieldType key to its registered handler, falling back to textarea.
 * @param {string | undefined} key
 */
export function getFieldType(key) {
  if (!key) return FIELD_TYPES[DEFAULT_FIELD_TYPE];
  return FIELD_TYPES[key] || FIELD_TYPES[DEFAULT_FIELD_TYPE];
}
