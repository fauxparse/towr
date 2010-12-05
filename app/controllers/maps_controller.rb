class MapsController < ApplicationController
  def index
    
  end

  def new
    @map = Map.new :user => current_user
  end
  
  def create
    @map = Map.new((params[:map]).merge(:user => current_user))
    @map.save
    redirect_to edit_map_path(@map) unless request.xhr?
  end

  def show
    @map = Map.find params[:id].to_map_code
  end

  def edit
    @map = Map.find params[:id].to_map_code
  end

  def update
    @map = Map.find params[:id].to_map_code
    @map.update_attributes params[:map]
    redirect_to edit_map_path(@map) unless request.xhr?
  end

end
