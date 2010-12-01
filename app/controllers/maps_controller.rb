class MapsController < ApplicationController
  def new
  end

  def show
    render :text => params[:id]
  end

end
