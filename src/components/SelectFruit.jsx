import React, { useEffect, useState } from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";

import "./SelectFruit.scss";
import axios from "axios";

const SelectFruit = () => {
  const [fruit, setFruit] = useState([]);
  const [commands, setCommads] = useState([]);
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [values, setValues] = useState({
    snadek: 0,
    kg: 0,
    price: 0,
  });
  const [editedPrice, setEditedPrice] = useState(0);
  const [modal, setModal] = useState({
    visible: false,
    cmdId: undefined,
  });

  const handleChange = (event) => {
    setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleChangeModal = (cmdId = undefined) => {
    if (modal.visible) {
      setModal((prev) => ({
        ...prev,
        visible: false,
        cmdId: undefined,
      }));

      setEditedPrice(0);
    } else {
      if (cmdId !== undefined) {
        setModal((prev) => ({
          ...prev,
          visible: true,
          cmdId: cmdId,
        }));

        setEditedPrice(0);
      }
    }
  };

  const handleSubmit = async (event) => {
    // event.preventdefault();

    if (!selectedFruit) return;

    const snadekWeight = +values.snadek * +selectedFruit.empty_box_weight_kg;
    const netWeight = +values.kg - +snadekWeight;
    const totalPrice = +netWeight * +values.price + +values.snadek;

    // const id = new Date().getTime();
    const { data: newCommands } = await axios.post(
      "http://localhost:3001/commandes",
      {
        fruit_id: selectedFruit.id,
        snadek: values.snadek,
        kg: values.kg,
        price: values.price,
        total: totalPrice,
        edited_price: 0,
      }
    );

    // console.log({ newCommands });
    setCommads((prev) => [...prev, newCommands]);
  };

  const handleEditedPrice = async () => {
    if (!modal.cmdId) return;

    const { data: editedCommand } = await axios.patch(
      `http://localhost:3001/commandes/${modal.cmdId}`,
      {
        edited_price: editedPrice,
      }
    );

    setCommads((prev) =>
      prev.map((cmd) => (cmd.id !== modal.cmdId ? cmd : editedCommand))
    );

    handleChangeModal();
  };

  useEffect(() => {
    const fetchFruits = async () => {
      try {
        const { data } = await axios.get("http://localhost:3001/fruits");
        setFruit(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchFruits();
  }, []);

  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        const { data } = await axios.get("http://localhost:3001/commandes");
        setCommads(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchCommandes();
  }, []);

  return (
    <>
      <Dialog
        header="Header"
        visible={modal.visible}
        style={{ width: "50vw" }}
        onHide={() => handleChangeModal()}
      >
        <article>
          <div className="">
            <label htmlFor="edited_price">edited_price</label>
            <InputNumber
              id="edited_price"
              value={editedPrice}
              onValueChange={(e) => setEditedPrice(e.target.value)}
            />
          </div>

          <Button label="Edit" onClick={handleEditedPrice} />
        </article>
      </Dialog>
      {fruit.length > 0 && (
        <div className="SelectFruit row flex justify-content-center">
          {fruit.map((fruit) => (
            <div
              key={fruit.id}
              className={
                selectedFruit && fruit.id === selectedFruit.id
                  ? "active button_holder col-3 mx-2"
                  : "button_holder col-3 mx-2"
              }
              onClick={() => setSelectedFruit(fruit)}
            >
              <button>
                <img
                  alt={fruit.fruit_name}
                  src={`images/${fruit.image_path}.webp`}
                ></img>
              </button>
              <h3>{fruit.fruit_name}</h3>
            </div>
          ))}

          <div className="form">
            <div className="">
              <label htmlFor="snadek">Snadek</label>
              <input
                type="text"
                id="snadek"
                name="snadek"
                value={values.snadek}
                onChange={handleChange}
              />
            </div>
            <div className="">
              <label htmlFor="kg">Kg</label>
              <input
                type="text"
                id="kg"
                name="kg"
                value={values.kg}
                onChange={handleChange}
              />
            </div>
            <div className="">
              <label htmlFor="price">Price</label>
              <input
                type="text"
                id="price"
                name="price"
                value={values.price}
                onChange={handleChange}
              />
            </div>
            <button onClick={handleSubmit}>Click</button>
          </div>

          {commands.length > 0 && (
            // <DataTable value={commands} tableStyle={{ minWidth: "50rem" }}>
            <DataTable
              value={commands}
              paginator
              rows={5}
              rowsPerPageOptions={[5, 10, 25, 50]}
              tableStyle={{ minWidth: "50rem" }}
              paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
              currentPageReportTemplate="{first} to {last} of {totalRecords}"
              //   paginatorLeft={paginatorLeft}
              //   paginatorRight={paginatorRight}
            >
              <Column field="id" header="Id"></Column>
              <Column
                field=""
                header="fruit_id"
                body={({ fruit_id }) =>
                  fruit.find((f) => f.id === fruit_id)?.fruit_name
                }
              ></Column>
              <Column field="snadek" header="snadek"></Column>
              <Column field="kg" header="kg"></Column>
              <Column field="price" header="price"></Column>
              <Column field="total" header="total"></Column>
              <Column
                field="edited_price"
                header="edited_price"
                body={({ id, edited_price }) => (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-evenly",
                      alignItems: "center",
                    }}
                  >
                    <span className="btn btn-primary me-2" style={{ flex: 1 }}>
                      {edited_price}
                    </span>
                    <Button
                      label="Edit"
                      icon="pi pi-file-edit"
                      onClick={() => handleChangeModal(id)}
                    />
                  </div>
                )}
              ></Column>
            </DataTable>
          )}
        </div>
      )}
    </>
  );
};

export default SelectFruit;

// {
//     "id": 0,
//     "fruit_id": 0,
//     "snadek": 0,
//     "kg": 0,
//     "price": 0,
//     "total": 0,
//     "edited_price": 0
//   },
