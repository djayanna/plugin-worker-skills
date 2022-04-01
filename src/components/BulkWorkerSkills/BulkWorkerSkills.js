import React from "react";
import "./BulkWorkerSkill.Styles.css";
import * as Flex from "@twilio/flex-ui";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { debounce } from "lodash";

import { StyledCheckbox } from "./BulkWorkerSkill.Styles";
import Helpers from "../../utils/helpers";

const styles = {
  contained: {
    borderRadius: "0px",
    textTransform: "uppercase",
    margin: "0",
    padding: "4px 20px",
    fontWeight: "bold",
    fontFamily: "inherit",
    fontSize: "11px",
  },
};

class BulkWorkerSkills extends React.Component {
  state = {
    workers: {},
    selectedWorkers: [],
    search: "",
    showMessage: null,
    error: null,
  };

  componentDidMount() {
    this.getWorkers();
  }

  getWorkers = () => {
    Flex.Manager.getInstance()
      .insightsClient.instantQuery("tr-worker")
      .then((q) => {
        q.on("searchResult", (items) => {
          console.log("workers", items);

          this.setState({
            error: null,
            workers: items,
            showMessage: null,
          });
        });

        let expression = this.state.search;

        if (!expression.match(/data\..*/) && expression !== "") {
          expression = `data.attributes.full_name CONTAINS "${expression}" OR data.friendly_name CONTAINS "${expression}"`;
        }

        q.search(expression).catch(() => {
          this.setState({ error: "Invalid query" });
        });
      });
  };

  updateWorkerList = debounce((search) => {
    this.setState({
      search,
    });
    this.getWorkers();
  }, 300);

  handleInputChange = (event) => {
    this.updateWorkerList(event.target.value);
  };

  updateWorkersAttributes = async () => {
    const { workerAttributes } = this.props;

    this.setState({ showMessage: "Saving changes .." });

    const workers = Object.keys(this.state.workers).reduce((pr, cur) => {
      const worker = this.state.workers[cur];
      if (this.state.selectedWorkers.includes(worker.worker_sid)) {
        return [...pr, worker];
      }

      return pr;
    }, []);

    const { routing, disabled_skills } = workerAttributes;
    const workerSkills = {
      routing,
      disabled_skills,
      skillsUpdatedBy,
      skillsUpdatedTimestamp,
    };

    const workerSids = this.state.selectedWorkers;
    const skillsUpdatedBy =
      Flex.Manager.getInstance().store.getState().flex.session.identity;
    const skillsUpdatedTimestamp = new Date().toISOString();

    await Helpers.request("workers-bulk-skills-update", {
      workerSids: JSON.stringify(workerSids),
      updatedAttributes: JSON.stringify(workerSkills),
    });

    this.setState({ showMessage: "Saved" });
    setTimeout(
      () => this.setState({ showMessage: null, selectedWorkers: [] }),
      2000
    );
  };

  handleChange = (event) => {
    const { selectedWorkers } = this.state;

    console.log(event.target);
    console.log(selectedWorkers);
    this.setState({
      selectedWorkers: event.target.checked
        ? [...selectedWorkers, event.target.id]
        : selectedWorkers.filter((elem) => elem !== event.target.id),
      showMessage: null,
    });
  };

  render() {
    const { classes } = this.props;

    const numberOfChecked = this.state.selectedWorkers
      ? Object.keys(this.state.selectedWorkers).length
      : 0;

    const error =
      ((numberOfChecked === 0 && this.state.search !== "") ||
        this.state.error) &&
      (this.state.error || "No worker matched");

    return (
      <div className="bulkWrapper">
        <div className="bulkTitle">Copy Skills to multiple agents</div>
        <div className="inputWrapper">
          <input
            type="text"
            className="input"
            onChange={this.handleInputChange}
            placeholder="Search Agents"
          />
        </div>
        {error && <div className="bulkResultDescription">{error}</div>}
        <div className="bulkList">
          {Object.keys(this.state.workers).map((workerSid) => {
            const name =
              this.state.workers[workerSid].attributes.full_name ||
              this.state.workers[workerSid].friendly_name;

            return (
              <FormControlLabel
                key={workerSid}
                control={
                  <StyledCheckbox
                    checked={
                      this.state.selectedWorkers
                        ? this.state.selectedWorkers.includes(workerSid)
                        : false
                    }
                    onChange={this.handleChange}
                    name={name}
                    color="primary"
                    id={workerSid}
                  />
                }
                label={name}
              />
            );
          })}
        </div>
        <div className="bulkButtons">
          <div className="bulkButtonDescription">
            {this.state.showMessage ? (
              <span className="bold">{this.state.showMessage}</span>
            ) : (
              <div>
                <span className="bold">{numberOfChecked}</span> selected
              </div>
            )}
          </div>
          <Button
            variant="contained"
            color="primary"
            classes={{
              contained: classes.contained,
            }}
            onClick={this.updateWorkersAttributes}
            disabled={
              error != null ||
              this.state.showMessage !== null ||
              this.props.isDirty ||
              this.state.selectedWorkers.length === 0
            }
          >
            Apply
          </Button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isDirty: state["worker-skills"].workerSkills.isDirty,
    workerAttributes:
      state["worker-skills"].workerSkills.selectedWorkerAttributes,
  };
};

export default connect(mapStateToProps)(withStyles(styles)(BulkWorkerSkills));
