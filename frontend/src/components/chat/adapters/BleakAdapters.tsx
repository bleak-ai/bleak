import React from "react";
import type {QuestionProps} from "@bleakai/core";
import {TextQuestion} from "../questions/TextQuestion";
import {RadioQuestion} from "../questions/RadioQuestion";
import {MultiSelectQuestion} from "../questions/MultiSelectQuestion";
import {SliderQuestion} from "../questions/SliderQuestion";

// Simple adapters that just pass through props to existing components
export const BleakTextQuestion: React.FC<QuestionProps> = (props) => (
  <TextQuestion {...props} />
);

export const BleakRadioQuestion: React.FC<QuestionProps> = (props) => (
  <RadioQuestion {...props} />
);

export const BleakMultiSelectQuestion: React.FC<QuestionProps> = (props) => (
  <MultiSelectQuestion {...props} />
);

export const BleakSliderQuestion: React.FC<QuestionProps> = (props) => (
  <SliderQuestion {...props} />
);
