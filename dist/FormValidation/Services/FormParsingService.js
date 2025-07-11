var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { inject, injectable } from "inversify";
import ContainerTypes from "../DI/ContainerTypes";
let FormParsingService = class FormParsingService {
    constructor(ruleParser) {
        this.ruleParser = ruleParser;
    }
    parse(form) {
        const fields = this.ruleParser.parseForm(form);
        const formName = form.getAttribute("name") || form.getAttribute("id") || "";
        // Gather initial field values
        const initialValues = {};
        for (const el of Array.from(form.elements)) {
            if (!el.name)
                continue;
            if (el.type === "checkbox") {
                initialValues[el.name] = el.checked;
            }
            else if (el.type === "radio") {
                if (el.checked)
                    initialValues[el.name] = el.value;
            }
            else {
                initialValues[el.name] = el.value;
            }
        }
        return { formName, fields, initialValues };
    }
};
FormParsingService = __decorate([
    injectable(),
    __param(0, inject(ContainerTypes.RuleParser)),
    __metadata("design:paramtypes", [Object])
], FormParsingService);
export { FormParsingService };
//# sourceMappingURL=FormParsingService.js.map