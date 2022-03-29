import styled from "react-emotion";
import { FormControlLabel, Input, Select } from "@material-ui/core";
import { FlexBox } from "@twilio/flex-ui-core";

export const StyledSelect = styled(Select)`
  margin-right: 16px;
  margin-bottom: auto;
  overflow-x: hidden;
  flex: 1 1 auto;
`;

export const AddPanelContainer = styled(FlexBox)`
  padding-left: 12px;
  padding-right: 12px;
  min-height: 48px;
`;

export const LevelInputAndButtonContainer = styled(FlexBox)`
  flex-basis: 0;
`;

export const RightButtonContainer = styled("div")`
  display: flex;
  flex: 0 0 28px;
  margin-left: 12px;
  & > * {
    margin: auto;
  }
`;

export const StyledSkillLevelInput = styled(Input)`
  flex: 0 0 56px;
  height: 32px;
  width: 56px;
`;

export const Container = styled(FlexBox)`
  padding-top: 12px;
  padding-bottom: 12px;
`;

export const SkillsContainer = styled(FlexBox)`
  padding-left: 12px;
  padding-right: 12px;
  overflow-x: hidden;
  overflow-y: auto;
`;

export const NoSkillsContainer = styled(FlexBox)`
  margin-top: 16px;
  & > * {
    margin: auto;
  }
`;

export const StyledFormControlLabel = styled(FormControlLabel)`
  flex: 1 1 auto;
  overflow: hidden;
  margin-bottom: auto;
`;

export const WorkerSkillContainer = styled(FlexBox)`
    padding-top: 6px;
    padding-bottom: 6px;
`;


export const NotificationTextContainer = styled(FlexBox)`
    margin-top: 12px;
    font-size: 10px;
    & > * {
        margin: auto;
    }
`;

export const ButtonsContainer = styled(FlexBox)`
    margin-top: 32px;
    padding-left: 12px;
    padding-right: 12px;
    overflow-x: hidden;
    overflow-y: auto;
    justify-content: center;
    & > * {
        margin-left: 6px;
        margin-right: 6px;
        min-width: 100px;
    }
`;
